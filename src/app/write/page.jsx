"use client";

import Image from "next/image";
import styles from "./writePage.module.css";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import('react-simple-wysiwyg'), { ssr: false });

const defaultCategories = [
    { slug: 'philosophy', title: 'Philosophy' },
    { slug: 'infiltration', title: 'Infiltration' },
    { slug: 'science', title: 'Science' },
    { slug: 'programs', title: 'Programs' },
    { slug: 'projects', title: 'Projects' },
];

const WritePage = () => {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const slugParam = searchParams?.get ? searchParams.get('slug') : null;

    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [media, setMedia] = useState("");
    const [value, setValue] = useState("");
    const [title, setTitle] = useState("");
    const [postSlug, setPostSlug] = useState("");
    const [catSlug, setCatSlug] = useState("");
    const [summary, setSummary] = useState("");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [postDate, setPostDate] = useState("");
    const [postTime, setPostTime] = useState("");
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaType, setMediaType] = useState("image");
    const [mediaUrl, setMediaUrl] = useState("");
    const [youtubeId, setYoutubeId] = useState("");
    const editorRef = useRef(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const cats = await res.json();
                    const categoryData = Array.isArray(cats) && cats.length > 0 ? cats : defaultCategories;
                    setCategories(categoryData);
                    if (!catSlug) {
                        setCatSlug(categoryData[0]?.slug || 'philosophy');
                    }
                } else {
                    throw new Error('Categories fetch failed');
                }
            } catch (err) {
                console.error('Failed to fetch categories', err);
                setCategories(defaultCategories);
                if (!catSlug) {
                    setCatSlug(defaultCategories[0].slug);
                }
            }
        };

        loadCategories();
    }, [catSlug]);

    useEffect(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const time = now.toTimeString().slice(0, 5);
        setPostDate(today);
        setPostTime(time);
    }, []);

    // Additional server-side validation: confirm the session corresponds to a real user
    // by calling the new /api/auth/me endpoint. If it fails, redirect away.
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok && mounted) {
                    router.push('/');
                }
            } catch (err) {
                console.error('auth verify error', err);
                if (mounted) router.push('/');
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                setUploading(true);
                const dataUrl = reader.result;
                const res = await fetch('/api/uploads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, data: dataUrl }),
                });
                if (res.ok) {
                    const json = await res.json();
                    setMedia(json.url);
                } else {
                    console.error('Upload failed', await res.text());
                    alert('Image upload failed');
                }
            } catch (err) {
                console.error(err);
                alert('Upload error: ' + err.message);
            } finally {
                setUploading(false);
                setFile(null);
            }
        };
        reader.readAsDataURL(file);
    }, [file]);

    useEffect(() => {
        if (!slugParam) return;
        (async () => {
            try {
                const res = await fetch(`/api/posts/${encodeURIComponent(slugParam)}`);
                if (res.ok) {
                    const post = await res.json();
                    setTitle(post.title || '');
                    setPostSlug(post.slug || '');
                    setSummary(post.summary || '');
                    setValue(post.desc || '');
                    setMedia(post.img || '');
                    setCatSlug(post.catSlug || '');
                    setPostDate(post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : '');
                    setPostTime(post.createdAt ? new Date(post.createdAt).toTimeString().slice(0, 5) : '');
                    setIsEdit(true);
                } else {
                    console.error('Failed to load post', await res.text());
                    alert('Could not load post for editing');
                }
            } catch (err) {
                console.error(err);
                alert('Error loading post: ' + err.message);
            }
        })();
    }, [slugParam]);

    if (status === "loading") {
        return <div className={styles.loading}>Loading...</div>;
    }

    // if the basic next-auth status says unauthenticated, redirect immediately
    if (status === "unauthenticated") {
        router.push("/");
        return <div className={styles.loading}>Redirecting...</div>;
    }

    // Note: API endpoints also enforce server-side user validation, so even if a token exists
    // client-side, it cannot be used to create or update posts unless it maps to a real DB user.

    const slugify = (str) =>
        String(str)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const editorModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean'],
        ],
    };

    const handleAddMedia = () => {
        try {
            let htmlToAdd = '';
            if (mediaType === 'image' && mediaUrl) {
                htmlToAdd = `<img src="${mediaUrl}" style="max-width:100%; height:auto;" alt="Image" />`;
            } else if (mediaType === 'youtube' && youtubeId) {
                const input = youtubeId.trim();
                const embeddedId = input.includes('youtube.com/embed/')
                    ? input.split('youtube.com/embed/')[1]?.split('?')[0]
                    : input.includes('youtu.be/')
                        ? input.split('youtu.be/')[1]?.split('?')[0]
                        : input;
                htmlToAdd = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${embeddedId}" frameborder="0" allowfullscreen></iframe>`;
            } else if (mediaType === 'audio' && mediaUrl) {
                htmlToAdd = `<audio controls style="width:100%;"><source src="${mediaUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
            }
            if (!htmlToAdd) {
                alert('Please provide valid media information');
                return;
            }
            setValue((current) => current + '\n' + htmlToAdd);
            setMediaUrl('');
            setYoutubeId('');
            setShowMediaModal(false);
        } catch (err) {
            console.error('Error adding media:', err);
            alert('Error adding media: ' + err.message);
        }
    };

    const getEditorContent = () => {
        const editor = editorRef.current?.getEditor?.();
        if (!editor?.root) return normalizeEditorHtml(value);

        const content = editor.root.cloneNode(true);
        const sourceImages = [...editor.root.querySelectorAll('img')];
        content.querySelectorAll('img').forEach((image, index) => {
            const inlineWidth = image.style.width || image.getAttribute('width');
            const renderedWidth = sourceImages[index]?.getBoundingClientRect().width || 0;
            const width = parseFloat(inlineWidth) || renderedWidth;

            if (width > 0) {
                image.style.width = `${Math.round(width)}px`;
                image.style.height = 'auto';
                image.removeAttribute('width');
            }
        });

        return normalizeEditorHtml(content.innerHTML);
    };

    const normalizeEditorHtml = (html) => {
        const documentParser = new DOMParser();
        const parsed = documentParser.parseFromString(html || '', 'text/html');

        parsed.querySelectorAll('img').forEach((image) => {
            const width = image.style.width || image.getAttribute('width');
            if (width) {
                image.style.width = /^\d+(\.\d+)?$/.test(width) ? `${width}px` : width;
                image.style.height = 'auto';
                image.removeAttribute('width');
            }
        });

        return parsed.body.innerHTML;
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (!value.trim()) {
            alert('Please write some content');
            return;
        }
        if (showNewCategory && !newCategoryName.trim()) {
            alert('Please enter a new category name or choose an existing one');
            return;
        }

        setSaving(true);
        try {
            const publishedAt = postDate ? `${postDate}T${postTime || '00:00'}:00` : undefined;
            const editorContent = getEditorContent();
            if (isEdit && slugParam) {
                const res = await fetch(`/api/posts/${encodeURIComponent(slugParam)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        slug: postSlug,
                        summary,
                        desc: editorContent,
                        img: media,
                        catSlug: showNewCategory ? undefined : catSlug || 'philosophy',
                        newCategory: showNewCategory ? newCategoryName.trim() : undefined,
                        createdAt: publishedAt,
                    }),
                });
                if (res.ok) {
                    const updated = await res.json();
                    router.push(`/posts/${updated.slug || slugParam}`);
                    return;
                }
                const errText = await res.text();
                console.error('Update failed', errText);
                alert('Failed to update post: ' + errText);
            } else {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        summary,
                        desc: editorContent,
                        img: media,
                        slug: postSlug || slugify(title),
                        catSlug: showNewCategory ? undefined : catSlug || 'philosophy',
                        createdAt: publishedAt,
                        newCategory: showNewCategory ? newCategoryName.trim() : undefined,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    window.location.href = `/posts/${data.slug}`;
                    return;
                }
                const errText = await res.text();
                console.error('Create post failed', errText);
                alert('Failed to publish post: ' + errText);
            }
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{isEdit ? 'Edit Post' : 'Write a Post'}</h1>
            </div>

            <input
                type="text"
                placeholder="Title"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <div className={styles.slugField}>
                <label htmlFor="post-slug">URL / Slug</label>
                <input
                    id="post-slug"
                    type="text"
                    placeholder={slugify(title) || "your-post-url"}
                    className={styles.slugInput}
                    value={postSlug}
                    onChange={(e) => setPostSlug(e.target.value)}
                    onBlur={() => setPostSlug((current) => current ? slugify(current) : "")}
                />
                <span>Post URL: /posts/{postSlug || slugify(title) || "your-post-url"}</span>
            </div>

            <textarea
                placeholder="Excerpt / preview text for the card"
                className={styles.textAreaSummary}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
            />

            <div className={styles.categorySection}>
                <div className={styles.categorySelector}>
                    <label>Category</label>
                    <select
                        className={styles.select}
                        value={showNewCategory ? 'new' : catSlug}
                        onChange={(e) => {
                            if (e.target.value === 'new') {
                                setShowNewCategory(true);
                                setCatSlug('');
                            } else {
                                setShowNewCategory(false);
                                setCatSlug(e.target.value);
                            }
                        }}
                    >
                        <option value="">Select category...</option>
                        {categories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                                {cat.title || cat.slug}
                            </option>
                        ))}
                        <option value="new">+ Create new category</option>
                    </select>
                </div>

                {showNewCategory && (
                    <input
                        type="text"
                        placeholder="New category name"
                        className={styles.input}
                        value={newCategoryName}
                        onChange={(e) => {
                            const nextName = e.target.value;
                            setNewCategoryName(nextName);
                            setCatSlug(nextName.trim().toLowerCase().replace(/\s+/g, '-'));
                        }}
                    />
                )}

                <div className={styles.dateSelector}>
                    <label>Publish Date</label>
                    <input
                        type="date"
                        value={postDate}
                        onChange={(e) => setPostDate(e.target.value)}
                        className={styles.dateInput}
                    />
                    <label>Publish Time</label>
                    <input
                        type="time"
                        value={postTime}
                        onChange={(e) => setPostTime(e.target.value)}
                        className={styles.dateInput}
                    />
                </div>
            </div>


            <div className={styles.editor}>
                <div className={styles.toolBar}>
                    <button className={styles.button} onClick={() => setOpen(!open)} type="button">
                        <Image src="/plus.png" alt="Add" width={16} height={16} />
                    </button>
                    <button
                        className={styles.button}
                        onClick={() => setShowMediaModal(true)}
                        type="button"
                        title="Add media (YouTube, image URLs, audio)"
                    >
                        <Image src="/video.png" alt="Media" width={16} height={16} />
                    </button>
                </div>

                {open && (
                    <div className={styles.add}>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            style={{ display: 'none' }}
                        />
                        <button className={styles.addButton} type="button" title="Upload featured image from device">
                            <label htmlFor="image">
                                <Image src="/image.png" alt="Upload" width={16} height={16} />
                            </label>
                        </button>
                    </div>
                )}

                {showMediaModal && (
                    <div className={styles.modalBackdrop} onClick={() => setShowMediaModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <h3>Add Media</h3>
                            <div className={styles.mediaTypes}>
                                <button
                                    className={`${styles.typeButton} ${mediaType === 'image' ? styles.active : ''}`}
                                    onClick={() => setMediaType('image')}
                                    type="button"
                                >
                                    Image URL
                                </button>
                                <button
                                    className={`${styles.typeButton} ${mediaType === 'youtube' ? styles.active : ''}`}
                                    onClick={() => setMediaType('youtube')}
                                    type="button"
                                >
                                    YouTube
                                </button>
                                <button
                                    className={`${styles.typeButton} ${mediaType === 'audio' ? styles.active : ''}`}
                                    onClick={() => setMediaType('audio')}
                                    type="button"
                                >
                                    Audio
                                </button>
                            </div>

                            {mediaType === 'image' && (
                                <input
                                    type="text"
                                    placeholder="Image URL (e.g., https://...)"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    className={styles.input}
                                />
                            )}

                            {mediaType === 'youtube' && (
                                <input
                                    type="text"
                                    placeholder="YouTube URL or Video ID"
                                    value={youtubeId}
                                    onChange={(e) => setYoutubeId(e.target.value)}
                                    className={styles.input}
                                />
                            )}

                            {mediaType === 'audio' && (
                                <input
                                    type="text"
                                    placeholder="Audio URL (MP3, WAV, etc.)"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    className={styles.input}
                                />
                            )}

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.secondary}
                                    onClick={() => setShowMediaModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles.primary}
                                    onClick={handleAddMedia}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <RichTextEditor
                    ref={editorRef}
                    className={styles.textArea}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Tell your story..."
                />
            </div>

            <div style={{ marginTop: 12 }}>
                <button
                    className={styles.publish}
                    onClick={handleSubmit}
                    disabled={uploading || saving}
                    type="button"
                >
                    {uploading || saving ? 'Saving...' : isEdit ? 'Update Post' : 'Publish'}
                </button>
            </div>
        </div>
    );
};

export default WritePage;
