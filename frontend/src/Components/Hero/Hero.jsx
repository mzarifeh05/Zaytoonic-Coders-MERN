import React, { useEffect, useRef } from 'react'
import style from './Hero.module.css'
import ramadanImage from '../../assets/ramadan-image.png'
import saeImage from '../../assets/sea-image.png'

const Hero = () => {
    const heroRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(style.visible)
                }
            },
            { threshold: 0.1 }
        )
        if (heroRef.current) observer.observe(heroRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section className={style.hero} ref={heroRef}>
            <div className={style.bgSea}>
                <img src={saeImage} alt="" aria-hidden="true" />
            </div>
            <div className={style.bgOverlay} />

            <div className={style.logoWrap}>
                <img src={ramadanImage} alt="Zaytoonic Coders Logo" className={style.logo} />
            </div>

            <div className={style.content}>
                <p className={style.eyebrow}>Al-Zaytoonah University of Jordan · IT Community</p>
                <h1 className={style.title}>
                    <span className={style.titleLine}>Zaytoonic</span>
                    <span className={style.titleAccent}>Coders</span>
                </h1>
                <p className={style.subtitle}>
                    Welcome to Zaytoonic Coders. We are a dedicated group of 12 IT students collaborating on tech, sharing knowledge, and growing as developers.
                </p>
                <div className={style.actions}>
                    <a href="#members" className={style.btnPrimary}>Meet the Team</a>
                    <a href="#activities" className={style.btnGhost}>Our Activities</a>
                </div>

                <div className={style.stats}>
                    <div className={style.stat}>
                        <span className={style.statNum}>12</span>
                        <span className={style.statLabel}>Members</span>
                    </div>
                    <div className={style.statDivider} />
                    <div className={style.stat}>
                        <span className={style.statNum}>∞</span>
                        <span className={style.statLabel}>Ideas Shared</span>
                    </div>
                    <div className={style.statDivider} />
                    <div className={style.stat}>
                        <span className={style.statNum}>1</span>
                        <span className={style.statLabel}>Community</span>
                    </div>
                </div>
            </div>

            <div className={style.circuitDots} aria-hidden="true">
                {[...Array(6)].map((_, i) => (
                    <span key={i} className={style.dot} style={{ '--i': i }} />
                ))}
            </div>

            <div className={style.scrollHint}>
                <span className={style.scrollLine} />
                <span className={style.scrollText}>scroll</span>
            </div>
        </section>
    )
}

export default Hero