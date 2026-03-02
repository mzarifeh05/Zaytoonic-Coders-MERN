import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Hero from "./Components/Hero/Hero"
import Card from "./Components/Card/Card"
import Footer from "./Components/Footer/Footer"
import style from "./App.module.css"

const API = import.meta.env.VITE_API_URL

function App() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(API)
      .then((res) => { setMembers(res.data); setLoading(false) })
      .catch(() => { setError("Failed to load members."); setLoading(false) })
  }, [])

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
      <button className={style.fabBtn} onClick={() => navigate("/manage")} title="Admin Panel">
        <span className={style.fabIcon}>⚙</span>
        <span className={style.fabLabel}>Admin</span>
      </button>
    </>
  )
}

export default App
