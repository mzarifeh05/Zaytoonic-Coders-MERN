import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../Footer/Footer'
import style from './ManageMembers.module.css'

const API           = import.meta.env.VITE_API_URL
const SECRET_KEY    = import.meta.env.VITE_SECRET_KEY
const CLOUD_NAME    = import.meta.env.VITE_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

const emptyForm = { name: '', major: '', bio: '', imgURL: '', linkedin: '', github: '' }

const ManageMembers = () => {
    const navigate = useNavigate()

    // ── Key gate ──
    const [unlocked, setUnlocked] = useState(false)
    const [keyInput, setKeyInput] = useState('')
    const [keyError, setKeyError] = useState(false)
    const [shaking, setShaking]   = useState(false)

    const handleKeySubmit = (e) => {
        e.preventDefault()
        if (keyInput === SECRET_KEY) {
            setUnlocked(true)
        } else {
            setKeyError(true)
            setShaking(true)
            setTimeout(() => setShaking(false), 500)
        }
    }

    // ── Admin state ──
    const [members, setMembers]     = useState([])
    const [loading, setLoading]     = useState(true)
    const [form, setForm]           = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [toast, setToast]         = useState(null)
    const [confirmId, setConfirmId] = useState(null)

    // image upload states
    const [imgFile, setImgFile]       = useState(null)
    const [imgPreview, setImgPreview] = useState('')
    const [uploading, setUploading]   = useState(false)
    const [dragOver, setDragOver]     = useState(false)
    const fileInputRef = useRef(null)

    /* ── fetch (only once unlocked) ── */
    const fetchMembers = () => {
        setLoading(true)
        axios.get(API)
            .then(r => { setMembers(r.data); setLoading(false) })
            .catch(() => { showToast('Failed to load members', 'error'); setLoading(false) })
    }

    useEffect(() => { if (unlocked) fetchMembers() }, [unlocked])

    /* ── toast ── */
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3200)
    }

    /* ── image handling ── */
    const handleImageFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error')
            return
        }
        setImgFile(file)
        setImgPreview(URL.createObjectURL(file))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        handleImageFile(file)
    }

    const handleFileInput = (e) => {
        const file = e.target.files[0]
        if (file) handleImageFile(file)
    }

    const clearImage = () => {
        setImgFile(null)
        setImgPreview('')
        setForm(prev => ({ ...prev, imgURL: '' }))
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const uploadToCloudinary = async () => {
        if (!imgFile) return form.imgURL
        setUploading(true)
        try {
            const data = new FormData()
            data.append('file', imgFile)
            data.append('upload_preset', UPLOAD_PRESET)
            const res = await axios.post(CLOUDINARY_URL, data)
            return res.data.secure_url
        } catch {
            showToast('Image upload failed. Try again.', 'error')
            return null
        } finally {
            setUploading(false)
        }
    }

    /* ── form handlers ── */
    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        if (!form.name.trim()) return showToast('Name is required', 'error')
        setSubmitting(true)

        try {
            let finalImgURL = form.imgURL
            if (imgFile) {
                const url = await uploadToCloudinary()
                if (!url) { setSubmitting(false); return }
                finalImgURL = url
            }

            const payload = { ...form, imgURL: finalImgURL }

            if (editingId) {
                await axios.put(`${API}/${editingId}`, payload)
                showToast(`${form.name} updated successfully`)
            } else {
                await axios.post(API, payload)
                showToast(`${form.name} added to the crew!`)
            }

            setForm(emptyForm)
            setEditingId(null)
            clearImage()
            fetchMembers()
        } catch {
            showToast('Something went wrong. Try again.', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = member => {
        setEditingId(member._id)
        setForm({
            name:     member.name     || '',
            major:    member.major    || '',
            bio:      member.bio      || '',
            imgURL:   member.imgURL   || '',
            linkedin: member.linkedin || '',
            github:   member.github   || '',
        })
        setImgFile(null)
        setImgPreview(member.imgURL || '')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setForm(emptyForm)
        setEditingId(null)
        clearImage()
    }

    const handleDeleteConfirm = id => setConfirmId(id)

    const handleDelete = async () => {
        if (!confirmId) return
        setDeletingId(confirmId)
        setConfirmId(null)
        try {
            await axios.delete(`${API}/${confirmId}`)
            showToast('Member removed from the crew')
            fetchMembers()
        } catch {
            showToast('Failed to delete member', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    const initials = name =>
        name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

    /* ══════════════════════════════════════════
       ADMIN UI — always rendered as background
       Key gate overlays it when locked
    ══════════════════════════════════════════ */
    return (
        <div className={style.page}>
            <div className={style.glowA} />
            <div className={style.glowB} />

            {/* ── Page header ── */}
            <header className={style.pageHeader}>
                <button className={style.backBtn} onClick={() => navigate('/')}>
                    ← Back to Home
                </button>
                <p className={style.eyebrow}>Admin Panel</p>
                <h1 className={style.pageTitle}>Manage <span>Members</span></h1>
                <p className={style.pageSub}>Add, edit, or remove crew members from Zaytoonic Coders</p>
            </header>

            <div className={style.layout}>

                {/* ══ LEFT: Form ══ */}
                <aside className={style.formPanel}>
                    <div className={style.formCard}>
                        <div className={style.formCardHeader}>
                            <div className={style.formCardIcon}>{editingId ? '✎' : '＋'}</div>
                            <div>
                                <h2 className={style.formTitle}>{editingId ? 'Edit Member' : 'Add New Member'}</h2>
                                <p className={style.formSub}>
                                    {editingId ? "Update the member's details below" : 'Fill in the details to add a new coder'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={style.form} noValidate>

                            {/* Name */}
                            <div className={style.fieldGroup}>
                                <label className={style.label} htmlFor="name">
                                    Full Name <span className={style.req}>*</span>
                                </label>
                                <input
                                    id="name" name="name" type="text"
                                    placeholder="e.g. Ahmad Al-Khalidi"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={style.input}
                                    autoComplete="off"
                                />
                            </div>

                            {/* Major */}
                            <div className={style.fieldGroup}>
                                <label className={style.label} htmlFor="major">Major / Specialization</label>
                                <input
                                    id="major" name="major" type="text"
                                    placeholder="e.g. Software Engineering"
                                    value={form.major}
                                    onChange={handleChange}
                                    className={style.input}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className={style.fieldGroup}>
                                <label className={style.label}>Profile Photo</label>

                                {imgPreview ? (
                                    <div className={style.previewBox}>
                                        <img src={imgPreview} alt="preview" className={style.previewImg} />
                                        <div className={style.previewInfo}>
                                            <span className={style.previewName}>
                                                {imgFile ? imgFile.name : 'Current photo'}
                                            </span>
                                            <button type="button" className={style.previewRemove} onClick={clearImage}>
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`${style.dropZone} ${dragOver ? style.dropZoneActive : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                    >
                                        <span className={style.dropIcon}>📷</span>
                                        <span className={style.dropText}>Click or drag & drop a photo</span>
                                        <span className={style.dropHint}>PNG, JPG, WEBP up to 10MB</span>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className={style.hiddenInput}
                                />
                            </div>

                            {/* Bio */}
                            <div className={style.fieldGroup}>
                                <label className={style.label} htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio" name="bio"
                                    placeholder="A short introduction about this member…"
                                    value={form.bio}
                                    onChange={handleChange}
                                    className={style.textarea}
                                    rows={3}
                                />
                            </div>

                            {/* LinkedIn */}
                            <div className={style.fieldGroup}>
                                <label className={style.label} htmlFor="linkedin">LinkedIn URL</label>
                                <input
                                    id="linkedin" name="linkedin" type="url"
                                    placeholder="https://linkedin.com/in/username"
                                    value={form.linkedin}
                                    onChange={handleChange}
                                    className={style.input}
                                />
                            </div>

                            {/* GitHub */}
                            <div className={style.fieldGroup}>
                                <label className={style.label} htmlFor="github">GitHub URL</label>
                                <input
                                    id="github" name="github" type="url"
                                    placeholder="https://github.com/username"
                                    value={form.github}
                                    onChange={handleChange}
                                    className={style.input}
                                />
                            </div>

                            <div className={style.formActions}>
                                {editingId && (
                                    <button type="button" className={style.btnCancel} onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className={style.btnSubmit} disabled={submitting || uploading}>
                                    {submitting || uploading
                                        ? <><span className={style.btnSpinner} /> {uploading ? 'Uploading…' : 'Saving…'}</>
                                        : editingId ? 'Save Changes' : 'Add Member'
                                    }
                                </button>
                            </div>

                        </form>
                    </div>
                </aside>

                {/* ══ RIGHT: Members list ══ */}
                <main className={style.listPanel}>
                    <div className={style.listHeader}>
                        <h2 className={style.listTitle}>Current Members</h2>
                        <span className={style.memberCount}>{members.length} coders</span>
                    </div>

                    {loading ? (
                        <div className={style.stateCenter}>
                            <div className={style.loader} />
                        </div>
                    ) : members.length === 0 ? (
                        <div className={style.stateCenter}>
                            <p className={style.emptyMsg}>No members yet. Add the first coder!</p>
                        </div>
                    ) : (
                        <ul className={style.memberList}>
                            {members.map(member => (
                                <li
                                    key={member._id}
                                    className={[
                                        style.memberRow,
                                        editingId === member._id ? style.memberRowActive : '',
                                        deletingId === member._id ? style.memberRowDeleting : '',
                                    ].join(' ')}
                                >
                                    {/* avatar */}
                                    <div className={style.rowAvatar}>
                                        {member.imgURL
                                            ? <img src={member.imgURL} alt={member.name} className={style.rowAvatarImg}
                                                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                                            : null
                                        }
                                        <div className={style.rowAvatarFallback} style={member.imgURL ? { display: 'none' } : {}}>
                                            {initials(member.name)}
                                        </div>
                                    </div>

                                    {/* info */}
                                    <div className={style.rowInfo}>
                                        <span className={style.rowName}>{member.name}</span>
                                        {member.major && <span className={style.rowMajor}>{member.major}</span>}
                                    </div>

                                    {/* actions */}
                                    <div className={style.rowActions}>
                                        <button
                                            className={style.btnEdit}
                                            onClick={() => handleEdit(member)}
                                            disabled={!!deletingId}
                                        >✎</button>
                                        <button
                                            className={style.btnDelete}
                                            onClick={() => handleDeleteConfirm(member._id)}
                                            disabled={!!deletingId}
                                        >
                                            {deletingId === member._id
                                                ? <span className={style.btnSpinnerSm} />
                                                : '✕'
                                            }
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>
            </div>

            <Footer />

            {/* ── Delete confirm modal ── */}
            {confirmId && (
                <div className={style.modalBackdrop} onClick={() => setConfirmId(null)}>
                    <div className={style.modal} onClick={e => e.stopPropagation()}>
                        <div className={style.modalIcon}>⚠</div>
                        <h3 className={style.modalTitle}>Remove Member?</h3>
                        <p className={style.modalBody}>
                            This will permanently delete the member from Zaytoonic Coders. This cannot be undone.
                        </p>
                        <div className={style.modalActions}>
                            <button className={style.btnCancel} onClick={() => setConfirmId(null)}>Cancel</button>
                            <button className={style.btnDeleteConfirm} onClick={handleDelete}>Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ── */}
            {toast && (
                <div className={`${style.toast} ${style[`toast_${toast.type}`]}`}>
                    <span className={style.toastIcon}>{toast.type === 'error' ? '✕' : '✓'}</span>
                    {toast.msg}
                </div>
            )}

            {/* ── Key Gate Overlay ── */}
            {!unlocked && (
                <div className={style.backdrop}>
                    <div className={`${style.popup} ${shaking ? style.shake : ''}`}>
                        <div className={style.popupIconWrap}>
                            <span className={style.popupIcon}>🔑</span>
                        </div>

                        <h2 className={style.popupTitle}>Admin Access</h2>
                        <p className={style.popupSub}>Enter the secret key to manage members</p>

                        <form onSubmit={handleKeySubmit} className={style.popupForm} noValidate>
                            <div className={style.popupFieldWrap}>
                                <input
                                    type="password"
                                    placeholder="Enter secret key…"
                                    value={keyInput}
                                    onChange={(e) => { setKeyInput(e.target.value); setKeyError(false) }}
                                    className={`${style.popupInput} ${keyError ? style.popupInputError : ''}`}
                                    autoFocus
                                />
                                {keyError && (
                                    <p className={style.popupError}>✕ Incorrect key. Access denied.</p>
                                )}
                            </div>
                            <button type="submit" className={style.popupSubmit}>
                                Unlock →
                            </button>
                        </form>

                        <button className={style.popupClose} onClick={() => navigate('/')}>✕</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageMembers
