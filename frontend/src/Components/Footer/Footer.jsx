import style from './Footer.module.css'

const Footer = () => {
    const year = new Date().getFullYear()

    return (
        <footer className={style.footer}>
            <div className={style.inner}>
                <span className={style.brand}>Zaytoonic Coders</span>
                <span className={style.dot}>·</span>
                <span className={style.copy}>© {year} All rights reserved</span>
                <span className={style.dot}>·</span>
                <span className={style.made}>Built with ❤ - Mohammed Zarifeh</span>
            </div>
            <div className={style.line} />
        </footer>
    )
}

export default Footer