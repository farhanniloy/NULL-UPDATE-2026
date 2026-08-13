"use client";

import Link from "next/link";
import styles from "./comments.module.css";
import Image from "next/image";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";

const fetcher = async (url) => {
    const res = await fetch(url);

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message);
        throw error;
    }

    return data;
};

const Comments = ({ postSlug }) => {
    const { status, data: session } = useSession();

    const { data, mutate, isLoading } = useSWR(
        `/api/comments?postSlug=${encodeURIComponent(postSlug)}`,
        fetcher
    );

    const [desc, setDesc] = useState("");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const inputRef = useRef(null);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = { desc, postSlug };
            if (status !== 'authenticated') {
                payload.name = name || 'guest';
            }
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(()=>({message:'Failed'}));
                alert(err.message || 'Failed to post comment');
            } else {
                setDesc('');
                setName('');
                mutate();
            }
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Comments</h1>
            {status === "authenticated" ? (
                <div className={styles.write}>
                    {replyingTo ? <div className={styles.replyingNote}>Replying to <strong>{replyingTo}</strong> • <button className={styles.cancelReply} onClick={() => { setReplyingTo(null); setDesc(''); }}>cancel</button></div> : null}
          <textarea
              ref={inputRef}
              placeholder="write a comment..."
              className={styles.input}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
          />
                    <button className={styles.button} onClick={handleSubmit} disabled={submitting}>
                        Send
                    </button>
                </div>
            ) : (
                <div className={styles.write}>
                    <input type="text" placeholder="Your name" className={styles.input} value={name} onChange={(e)=>setName(e.target.value)} />
                    {replyingTo ? <div className={styles.replyingNote}>Replying to <strong>{replyingTo}</strong> • <button className={styles.cancelReply} onClick={() => { setReplyingTo(null); setDesc(''); }}>cancel</button></div> : null}
                    <textarea
                        ref={inputRef}
                        placeholder="write a comment..."
                        className={styles.input}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                    <button className={styles.button} onClick={handleSubmit} disabled={submitting}>
                        Send
                    </button>
                </div>
            )}
            <div className={styles.comments}>
                {isLoading
                    ? "loading"
                    : data?.map((item) => (
                        <div className={styles.comment} key={item.id}>
                            <div className={styles.user}>
                                    {item?.user?.image ? (
                                    <Image
                                        src={item.user.image}
                                        alt=""
                                        width={50}
                                        height={50}
                                        className={styles.image}
                                    />
                                ) : item.avatar ? (
                                    <img src={item.avatar} alt="" width={50} height={50} className={styles.image} />
                                ) : null}
                                <div className={styles.userInfo}>
                                    <div className={styles.userMeta}>
                                    {/* show username with @ and link to public profile when comment is by a known user */}
                                    {item.user ? (
                                      (() => {
                                        const raw = item.user.username || (item.user.email ? item.user.email.split('@')[0] : 'user');
                                        const display = raw.startsWith('@') ? raw : `@${raw}`;
                                        const slug = raw.startsWith('@') ? raw.slice(1) : raw;
                                        return (
                                          <>
                                            <Link href={`/u/${encodeURIComponent(slug)}`} className={styles.authorLink}>
                                              <span className={styles.username}>{display}</span>
                                            </Link>
                                            <span className={styles.date}>{new Date(item.createdAt).toISOString().substring(0, 10)}</span>
                                          </>
                                        );
                                      })()
                                    ) : (
                                      <>
                                        <span className={styles.username}>{item.name || 'Guest'}</span>
                                        <span className={styles.date}>{new Date(item.createdAt).toISOString().substring(0, 10)}</span>
                                      </>
                                    )}
                                    </div>

                                    <button className={styles.replyButton} onClick={() => {
                                        // determine mention name
                                        let mention = item.name || (item.user ? (item.user.username || (item.user.email ? item.user.email.split('@')[0] : 'user')) : 'user');
                                        if (!mention.startsWith('@')) mention = `@${mention}`;
                                        setReplyingTo(mention);
                                        setDesc(`${mention} `);
                                        // focus the textarea
                                        setTimeout(() => {
                                            try { inputRef.current?.focus(); } catch(e){}
                                            try { inputRef.current?.scrollIntoView({behavior:'smooth', block:'center'}); } catch(e){}
                                        }, 50);
                                    }}>Reply</button>
                                </div>
                            </div>
                            <p className={styles.desc}>{item.desc}</p>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Comments;