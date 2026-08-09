import styles from "./copyright.module.css"
import {FaCopyright} from "react-icons/fa6";
import {FaGithub, FaGithubSquare} from "react-icons/fa";

const Copyright = () => {
    return(
        <div className={styles.copyright}>
            <p className={styles.text}>
                <FaCopyright /> All rights reserved by <a href="/u/nil"><strong>@nil</strong></a>
                <span> | </span>
                <a href="https://github.com/niloy-farhan/fullstack-blog-for-null"
                   target="_blank"
                   rel="noopener noreferrer">
                    <FaGithub /> source
                </a>
            </p>
        </div>
    )
}

export default Copyright