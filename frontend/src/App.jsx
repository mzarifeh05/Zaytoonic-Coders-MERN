import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Hero from "./Components/Hero/Hero"
import Card from "./Components/Card/Card"
import Footer from "./Components/Footer/Footer"
import style from "./App.module.css"

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY
const API = import.meta.env.VITE_API_URL

function App() {
  const [members, setMembers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [keyInput, setKeyInput]   = useState("")
  const [keyError, setKeyError]   = useState(false)
  const [shaking, setShaking]     = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(API)
      .then((res) => { setMembers(res.data); setLoading(false) })
      .catch(() => { setError("Failed to load members."); setLoading(false) })
  }, [])

  const openPopup = () => {
    setKeyInput("")
    setKeyError(false)
    setShowPopup(true)
  }

  const closePopup = () => {
    setShowPopup(false)
    setKeyInput("")
    setKeyError(false)
  }

  const handleKeySubmit = (e) => {
    e.preventDefault()
    if (keyInput === SECRET_KEY) {
      setShowPopup(false)
      navigate("/manage")
    } else {
      setKeyError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <>
      <Hero />

      <section className={style.membersSection} id="members">
        <div className={style.sectionHeader}>
          <p className={style.sectionEyebrow}>The Crew</p>
          <h2 className={style.sectionTitle}>Meet the <span>Coders</span></h2>
          <p className={style.sectionSub}>12 students. One mission. Infinite ideas.</p>
        </div>

        {loading && (
          <div className={style.stateWrap}>
            <div className={style.loader} />
            <p className={style.stateText}>Loading members…</p>
          </div>
        )}

        {error && (
          <div className={style.stateWrap}>
            <p className={style.errorText}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className={style.grid}>
            {members.map((member, index) => (
              <Card
                key={member._id || index}
                name={member.name}
                major={member.major}
                bio={member.bio}
                imgURL={member.imgURL}
                linkedin={member.linkedin}
                github={member.github}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />

      {/* ── Floating Admin Button ── */}
      <button className={style.fabBtn} onClick={openPopup} title="Admin Panel">
        <span className={style.fabIcon}>⚙</span>
        <span className={style.fabLabel}>Admin</span>
      </button>

      {/* ── Key Popup Modal ── */}
      {showPopup && (
        <div className={style.backdrop} onClick={closePopup}>
          <div
            className={`${style.popup} ${shaking ? style.shake : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={style.popupClose} onClick={closePopup}>✕</button>

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
                  className={`${style.popupInput} ${keyError ? style.popupInputError : ""}`}
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
          </div>
        </div>
      )}
    </>
  )
}

export default App