'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from "./featured.module.css";
import { useRouter } from 'next/navigation';

const typingSegments = [
    { text: "hey, it's Nil. ", bold: false },
    { text: "i'm a ", bold: false },
    { text: "monk", bold: true },
    { text: ", ", bold: false },
    { text: "who's a ", bold: false },
    { text: "philosopher", bold: true },
    { text: ", passionate about ", bold: false },
    { text: "Artificial intelligence", bold: true },
    { text: ", ", bold: false },
    { text: "embedded systems", bold: true },
    { text: ", ", bold: false },
    { text: "hacking", bold: true },
    { text: " and finds ", bold: false },
    { text: "physics", bold: true },
    { text: " fun. if i'm living, it's because there exist some great ", bold: false },
    { text: "movies and tv shows", bold: true },
    { text: " that I enjoy. here i post my ", bold: false },
    { text: "philosophies", bold: true },
    { text: " and the philosophies i find ", bold: false },
    { text: "interesting", bold: false },
    { text: ".", bold: false },
];

const TOTAL_CHARACTERS = typingSegments.reduce((sum, segment) => sum + segment.text.length, 0);

const Featured = () => {
    const router = useRouter();
    const [typedCount, setTypedCount] = useState(0);
    const [promptValue, setPromptValue] = useState('');
    const [response, setResponse] = useState('');
    const inputRef = useRef(null);

    const typedOutput = useMemo(() => {
        const output = [];
        let remaining = typedCount;

        for (const segment of typingSegments) {
            if (remaining <= 0) break;
            const visible = segment.text.slice(0, Math.min(segment.text.length, remaining));
            if (visible.length > 0) {
                output.push({ text: visible, bold: segment.bold });
                remaining -= visible.length;
            }
        }

        return output;
    }, [typedCount]);

    const typingComplete = typedCount >= TOTAL_CHARACTERS;

    useEffect(() => {
        if (typedCount >= TOTAL_CHARACTERS) return undefined;

        const progress = typedCount / TOTAL_CHARACTERS;
        const acceleration = Math.pow(progress, 3);
        const baseSpeed = 36 - Math.round(acceleration * 32); // accelerate exponentially as it types
        const delay = Math.max(4, baseSpeed + Math.floor(Math.random() * 6));
        const timeout = window.setTimeout(() => {
            setTypedCount((value) => Math.min(value + 1, TOTAL_CHARACTERS));
        }, delay);

        return () => window.clearTimeout(timeout);
    }, [typedCount]);

    useEffect(() => {
        if (typingComplete && inputRef.current) {
            inputRef.current.focus();
        }
    }, [typingComplete]);

    const handlePromptSubmit = () => {
        const trimmed = promptValue.trim().toLowerCase();
        if (trimmed === 'yes' || trimmed === 'y') {
            router.push('/about');
        } else if (trimmed.length > 0) {
            setResponse('unknown command — type yes / y to continue');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.fp}>
                <div className={styles.terminalHeader}>
                    <span className={styles.terminalDot} />
                    <span className={styles.terminalDot} />
                    <span className={styles.terminalDot} />
                    <span className={styles.terminalTitle}>~/null</span>
                </div>
                <div className={styles.terminalBody}>
                    <div className={styles.terminalCommandRow}>
                        <span className={styles.terminalPrompt}>root@null:~$</span>
                        <span className={styles.typingText}>
                            {typedOutput.map((segment, index) => (
                                segment.bold ? (
                                    <strong key={index} className={styles.str}>
                                        {segment.text}
                                    </strong>
                                ) : (
                                    <span key={index}>{segment.text}</span>
                                )
                            ))}
                        </span>
                    </div>
                    {typingComplete && (
                        <div className={styles.terminalPromptBlock}>
                            <span className={styles.terminalInstruction}>more about me?</span>
                        </div>
                    )}
                    {typingComplete && (
                        <div className={styles.terminalInputBlock}>
                            <span className={styles.terminalArrow}>→</span>
                            <input
                                ref={inputRef}
                                className={styles.terminalInput}
                                value={promptValue}
                                onChange={(event) => setPromptValue(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handlePromptSubmit();
                                    }
                                }}
                                placeholder="yes / y"
                                aria-label="Type yes or y to learn more about me"
                            />
                        </div>
                    )}
                    {response && <div className={styles.terminalResponse}>{response}</div>}
                </div>
            </div>
        </div>
    );
};

export default Featured;