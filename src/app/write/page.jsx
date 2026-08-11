"use client";

import Image from "next/image";
import styles from "./writePage.module.css";
import { Suspense, useEffect, useRef, useState } from "react";
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

const getLocalDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLocalTime = (date = new Date()) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const toLocalDateTimeIso = (date, time) => {
    const localDate = new Date(`${date}T${time || '00:00'}:00`);
    return Number.isNaN(localDate.valueOf()) ? undefined : localDate.toISOString();
};

const WritePageContent = () => {
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
    const [catSlugs, setCatSlugs] = useState([]);
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
    const editorContainerRef = useRef(null);
    const savedSelectionRef = useRef(null);
    const selectedImageRef = useRef(null);
    const resizeRef = useRef(null);
    const [imageSelection, setImageSelection] = useState(null);
    const [toolbarState, setToolbarState] = useState({});

    const saveEditorSelection = () => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (!editor || !selection?.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
            savedSelectionRef.current = range.cloneRange();
        }
    };

    const updateToolbarState = () => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (!editor || !selection?.rangeCount || !editor.contains(selection.anchorNode)) return;

        let block = selection.anchorNode.nodeType === Node.ELEMENT_NODE
            ? selection.anchorNode
            : selection.anchorNode.parentElement;
        while (block && block !== editor && !/^(P|DIV|H1|H2|H3|H4|H5|H6|BLOCKQUOTE|PRE|LI)$/.test(block.tagName)) {
            block = block.parentElement;
        }

        setToolbarState({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            unorderedList: Boolean(block?.closest('ul')),
            orderedList: Boolean(block?.closest('ol')),
            blockquote: block?.tagName === 'BLOCKQUOTE',
            code: block?.tagName === 'PRE',
            block: block?.tagName || 'DIV',
        });
    };

    const restoreEditorSelection = () => {
        const selection = window.getSelection();
        const range = savedSelectionRef.current;
        if (!selection || !range) return;

        selection.removeAllRanges();
        selection.addRange(range);
        editorRef.current?.focus();
    };

    const handleEditorSelection = () => {
        saveEditorSelection();
        updateToolbarState();
    };

    const handleEditorChange = (event) => {
        const nextValue = event.target.value ?? event.target.innerHTML ?? "";
        setValue(nextValue);
        saveEditorSelection();
    };

    const handleEditorKeyDown = (event) => {
        if (!(event.ctrlKey || event.metaKey)) return;

        const shortcuts = {
            b: 'bold',
            i: 'italic',
            u: 'underline',
        };
        const command = shortcuts[event.key.toLowerCase()];
        if (command) {
            event.preventDefault();
            runEditorCommand(command);
        } else if (event.key.toLowerCase() === 'k') {
            event.preventDefault();
            addEditorLink();
        }
    };

    const runEditorCommand = (command, value = undefined) => {
        restoreEditorSelection();
        if (command === 'foreColor' || command === 'hiliteColor') {
            document.execCommand('styleWithCSS', false, true);
        }
        document.execCommand(command, false, value);
        saveEditorSelection();
        updateToolbarState();
        if (editorRef.current) {
            handleEditorChange({ target: { value: editorRef.current.innerHTML } });
        }
    };

    const runEditorCommandWithValue = (command, event) => {
        runEditorCommand(command, event.target.value);
    };

    const addEditorLink = () => {
        const url = window.prompt('Link URL', 'https://');
        if (url) runEditorCommand('createLink', url);
    };

    const handleEditorPaste = (event) => {
        const text = event.clipboardData?.getData('text/plain');
        const editor = editorRef.current;
        const selection = window.getSelection();

        if (!text || !editor || !selection?.rangeCount) return;

        event.preventDefault();
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;

        range.deleteContents();
        const fragment = document.createDocumentFragment();
        const lines = text.replace(/\r\n?/g, '\n').split('\n');

        lines.forEach((line, index) => {
            if (line) fragment.appendChild(document.createTextNode(line));
            if (index < lines.length - 1) fragment.appendChild(document.createElement('br'));
        });

        const lastNode = fragment.lastChild;
        range.insertNode(fragment);
        range.collapse(false);
        if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
        }

        selection.removeAllRanges();
        selection.addRange(range);
        saveEditorSelection();
        updateToolbarState();
        handleEditorChange({ target: { value: editor.innerHTML } });
    };

    useEffect(() => {
        document.addEventListener('selectionchange', updateToolbarState);
        return () => document.removeEventListener('selectionchange', updateToolbarState);
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const cats = await res.json();
                    const categoryData = Array.isArray(cats) && cats.length > 0 ? cats : defaultCategories;
                    setCategories(categoryData);
                    setCatSlugs((current) => current.length > 0
                        ? current
                        : [categoryData[0]?.slug || 'philosophy']);
                } else {
                    throw new Error('Categories fetch failed');
                }
            } catch (err) {
                console.error('Failed to fetch categories', err);
                setCategories(defaultCategories);
                setCatSlugs((current) => current.length > 0
                    ? current
                    : [defaultCategories[0].slug]);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const now = new Date();
        setPostDate(getLocalDate(now));
        setPostTime(getLocalTime(now));
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
    }, [router]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/");
        }
    }, [router, status]);

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
                    setCatSlugs(
                        post.categories?.map((category) => category.categorySlug) ||
                        (post.catSlug ? [post.catSlug] : []),
                    );
                    // Preserve original publish date/time when editing so updates don't overwrite it
                    if (post.createdAt) {
                        try {
                            const original = new Date(post.createdAt);
                            if (!Number.isNaN(original.valueOf())) {
                                setPostDate(getLocalDate(original));
                                setPostTime(getLocalTime(original));
                            }
                        } catch (e) {
                            // ignore parse errors and leave current date/time
                        }
                    }
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

    if (status === "unauthenticated") {
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

    const getYouTubeEmbedUrl = (input) => {
        const value = input.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
            return `https://www.youtube.com/embed/${value}`;
        }

        try {
            const url = new URL(value);
            if (!['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(url.hostname)) {
                return '';
            }
            let id = '';
            if (['youtu.be', 'www.youtu.be'].includes(url.hostname)) {
                id = url.pathname.slice(1);
            } else if (['youtube.com', 'www.youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(url.hostname)) {
                id = url.searchParams.get('v') || url.pathname.split('/').pop();
            }
            return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? `https://www.youtube.com/embed/${id}` : '';
        } catch {
            return '';
        }
    };

    const getFacebookVideoEmbedUrl = (input) => {
        const value = input.trim();
        if (!value) return '';

        try {
            const url = new URL(value);
            const allowedHosts = ['facebook.com', 'www.facebook.com', 'm.facebook.com'];
            if (!allowedHosts.includes(url.hostname)) {
                return '';
            }

            const videoHref = url.href;
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoHref)}&show_text=false&width=560`;
        } catch {
            return '';
        }
    };

    const insertEditorHtml = (html) => {
        const editor = editorRef.current;
        restoreEditorSelection();
        const selection = window.getSelection();
        if (!editor || !selection?.rangeCount) {
            setValue((current) => `${current}\n${html}`);
            return;
        }

        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) {
            setValue((current) => `${current}\n${html}`);
            return;
        }

        range.deleteContents();
        const container = document.createElement('div');
        container.innerHTML = html;
        const fragment = document.createDocumentFragment();
        let lastNode = null;
        while (container.firstChild) {
            lastNode = fragment.appendChild(container.firstChild);
        }
        range.insertNode(fragment);
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        saveEditorSelection();
        handleEditorChange({ target: { value: editor.innerHTML } });
    };

    const insertTable = () => {
        insertEditorHtml(
            '<table><tbody><tr><td> </td><td> </td><td> </td></tr><tr><td> </td><td> </td><td> </td></tr><tr><td> </td><td> </td><td> </td></tr></tbody></table><p><br></p>',
        );
    };

    const handleAddMedia = () => {
        try {
            let htmlToAdd = '';
            if (mediaType === 'image' && mediaUrl) {
                try {
                    const imageUrl = new URL(mediaUrl.trim());
                    if (!['http:', 'https:'].includes(imageUrl.protocol)) {
                        throw new Error('unsupported protocol');
                    }
                    htmlToAdd = `<img src="${imageUrl.href}" style="max-width:100%; height:auto;" alt="Image" />`;
                } catch {
                    alert('Please provide a valid remote image URL (http/https)');
                    return;
                }
            } else if (mediaType === 'youtube' && youtubeId) {
                const embedUrl = getYouTubeEmbedUrl(youtubeId);
                if (!embedUrl) {
                    alert('Please provide a valid YouTube URL or 11-character video ID');
                    return;
                }
                htmlToAdd = `<iframe width="100%" height="400" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="YouTube video"></iframe>`;
            } else if (mediaType === 'facebook' && mediaUrl) {
                const embedUrl = getFacebookVideoEmbedUrl(mediaUrl);
                if (!embedUrl) {
                    alert('Please provide a valid Facebook video URL');
                    return;
                }
                htmlToAdd = `<iframe src="${embedUrl}" width="100%" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" title="Facebook video"></iframe>`;
            } else if (mediaType === 'audio' && mediaUrl) {
                try {
                    const audioUrl = new URL(mediaUrl.trim());
                    if (!['http:', 'https:'].includes(audioUrl.protocol)) throw new Error('unsupported protocol');
                    htmlToAdd = `<audio controls><source src="${audioUrl.href}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
                } catch {
                    alert('Please provide a valid audio URL');
                    return;
                }
            }
            if (!htmlToAdd) {
                alert('Please provide valid media information');
                return;
            }
            insertEditorHtml(htmlToAdd);
            setMediaUrl('');
            setYoutubeId('');
            setShowMediaModal(false);
        } catch (err) {
            console.error('Error adding media:', err);
            alert('Error adding media: ' + err.message);
        }
    };

    const getEditorContent = () => {
        const editor = editorRef.current;
        if (!editor) return normalizeEditorHtml(value);

        const content = editor.cloneNode(true);
        const sourceImages = [...editor.querySelectorAll('img')];
        content.querySelectorAll('img').forEach((image, index) => {
            const inlineWidth = image.style.width || image.getAttribute('width');
            const renderedWidth = sourceImages[index]?.getBoundingClientRect().width || 0;
            const width = parseFloat(inlineWidth) || renderedWidth;

            if (width > 0) {
                image.setAttribute('width', String(Math.round(width)));
                image.style.removeProperty('width');
                image.style.removeProperty('height');
            }
        });

        return normalizeEditorHtml(content.innerHTML);
    };

    const wordCount = String(value ?? "")
        .replace(/<[^>]*>/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    const updateImageSelection = () => {
        const image = selectedImageRef.current;
        const container = editorContainerRef.current;
        if (!image || !container || !image.isConnected) {
            setImageSelection(null);
            return;
        }

        const imageRect = image.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setImageSelection({
            left: imageRect.left - containerRect.left + container.scrollLeft,
            top: imageRect.top - containerRect.top + container.scrollTop,
            width: imageRect.width,
            height: imageRect.height,
        });
    };

    const handleEditorClick = (event) => {
        const image = event.target.closest?.('img');
        if (!image || !editorRef.current?.contains(image)) {
            selectedImageRef.current = null;
            setImageSelection(null);
            return;
        }

        selectedImageRef.current = image;
        updateImageSelection();
    };

    const handleResizeStart = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const image = selectedImageRef.current;
        if (!image) return;

        resizeRef.current = {
            image,
            startX: event.clientX,
            startWidth: image.getBoundingClientRect().width,
        };
        document.addEventListener('pointermove', handleResizeMove);
        document.addEventListener('pointerup', handleResizeEnd, { once: true });
    };

    const handleResizeMove = (event) => {
        const resize = resizeRef.current;
        const container = editorContainerRef.current;
        if (!resize || !container) return;

        const maxWidth = Math.max(40, container.clientWidth - 32);
        const nextWidth = Math.min(
            maxWidth,
            Math.max(40, resize.startWidth + event.clientX - resize.startX),
        );
        resize.image.style.width = `${Math.round(nextWidth)}px`;
        resize.image.style.height = 'auto';
        updateImageSelection();
    };

    const handleResizeEnd = () => {
        const resize = resizeRef.current;
        resizeRef.current = null;
        document.removeEventListener('pointermove', handleResizeMove);

        if (resize?.image) {
            resize.image.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
        }
    };

    const normalizeEditorHtml = (html) => {
        const documentParser = new DOMParser();
        const parsed = documentParser.parseFromString(html || '', 'text/html');

        parsed.querySelectorAll('img').forEach((image) => {
            const width = image.style.width || image.getAttribute('width');
            if (width) {
                const numericWidth = parseFloat(width);
                if (Number.isFinite(numericWidth) && numericWidth > 0) {
                    image.setAttribute('width', String(Math.round(numericWidth)));
                    image.style.removeProperty('width');
                    image.style.removeProperty('height');
                }
            }
        });

        return parsed.body.innerHTML;
    };

    const handleSubmit = async () => {
        const editorContent = getEditorContent();
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (!editorContent.trim()) {
            alert('Please write some content');
            return;
        }
        if (showNewCategory && !newCategoryName.trim()) {
            alert('Please enter a new category name or choose an existing one');
            return;
        }

        setSaving(true);
        try {
            const publishedAt = postDate ? toLocalDateTimeIso(postDate, postTime) : undefined;
            if (isEdit && slugParam) {
                const res = await fetch(`/api/posts/${encodeURIComponent(slugParam)}`, {
                    method: 'PUT',
                    cache: 'no-store',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        slug: postSlug,
                        summary,
                        desc: editorContent,
                        img: media,
                        catSlugs,
                        newCategory: newCategoryName.trim() || undefined,
                        createdAt: publishedAt,
                    }),
                });
                if (res.ok) {
                    const updated = await res.json();
                    const destination = `/posts/${updated.slug || slugParam}`;
                    router.replace(destination);
                    router.refresh();
                    return;
                }
                const errText = await res.text();
                console.error('Update failed', errText);
                alert('Failed to update post: ' + errText);
            } else {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    cache: 'no-store',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        summary,
                        desc: editorContent,
                        img: media,
                        slug: postSlug || slugify(title),
                        catSlugs,
                        createdAt: publishedAt,
                        newCategory: newCategoryName.trim() || undefined,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    router.push(`/posts/${data.slug}`);
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
                    <label htmlFor="post-categories">Categories</label>
                    <select
                        id="post-categories"
                        className={styles.select}
                        multiple
                        value={catSlugs}
                        onChange={(e) => {
                            setCatSlugs(Array.from(e.target.selectedOptions, (option) => option.value));
                        }}
                    >
                        {categories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                                {cat.title || cat.slug}
                            </option>
                        ))}
                    </select>
                    <span>Select one or more categories (use Ctrl/Cmd-click).</span>
                </div>

                <div className={styles.newCategoryField}>
                    <input
                        type="text"
                        placeholder="Add a new category (optional)"
                        className={styles.input}
                        value={newCategoryName}
                        onChange={(e) => {
                            const nextName = e.target.value;
                            setNewCategoryName(nextName);
                            setShowNewCategory(Boolean(nextName.trim()));
                        }}
                    />
                </div>

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


            <div
                ref={editorContainerRef}
                className={styles.editor}
                onClick={handleEditorClick}
                onScroll={updateImageSelection}
            >
                <div className={styles.toolBar}>
                    <button className={styles.button} onClick={() => setOpen(!open)} type="button">
                        <Image src="/plus.png" alt="Add" width={16} height={16} />
                    </button>
                    <button
                        className={styles.button}
                        onClick={() => setShowMediaModal(true)}
                        type="button"
                        title="Add media (remote image, YouTube, Facebook, audio)"
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
                        <button
                            className={styles.addButton}
                            type="button"
                            title="Upload featured image from device"
                            onClick={() => document.getElementById('image')?.click()}
                        >
                            <Image src="/image.png" alt="Upload" width={16} height={16} />
                        </button>

                        <button
                            className={styles.addButton}
                            type="button"
                            title="Add remote image URL"
                            onClick={() => {
                                setMediaType('image');
                                setMediaUrl('');
                                setYoutubeId('');
                                setOpen(false);
                                setShowMediaModal(true);
                            }}
                        >
                            <Image src="/image.png" alt="Remote image" width={16} height={16} />
                        </button>

                        <button
                            className={styles.addButton}
                            type="button"
                            title="Add YouTube video"
                            onClick={() => {
                                setMediaType('youtube');
                                setYoutubeId('');
                                setMediaUrl('');
                                setOpen(false);
                                setShowMediaModal(true);
                            }}
                        >
                            <Image src="/video.png" alt="YouTube" width={16} height={16} />
                        </button>

                        <button
                            className={styles.addButton}
                            type="button"
                            title="Add Facebook video"
                            onClick={() => {
                                setMediaType('facebook');
                                setMediaUrl('');
                                setYoutubeId('');
                                setOpen(false);
                                setShowMediaModal(true);
                            }}
                        >
                            <Image src="/video.png" alt="Facebook video" width={16} height={16} />
                        </button>

                        <button
                            className={styles.addButton}
                            type="button"
                            title="Add audio"
                            onClick={() => {
                                setMediaType('audio');
                                setMediaUrl('');
                                setYoutubeId('');
                                setOpen(false);
                                setShowMediaModal(true);
                            }}
                        >
                            <Image src="/video.png" alt="Audio" width={16} height={16} />
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
                                    className={`${styles.typeButton} ${mediaType === 'facebook' ? styles.active : ''}`}
                                    onClick={() => setMediaType('facebook')}
                                    type="button"
                                >
                                    Facebook Video
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
                                    placeholder="Remote image URL (CDN / online image, e.g. https://...)"
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

                            {mediaType === 'facebook' && (
                                <input
                                    type="text"
                                    placeholder="Facebook video URL (https://facebook.com/.../videos/...)"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
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
                    onChange={handleEditorChange}
                    onBlur={handleEditorChange}
                    onSelect={handleEditorSelection}
                    onKeyUp={handleEditorSelection}
                    onKeyDown={handleEditorKeyDown}
                    onMouseUp={handleEditorSelection}
                    onInput={updateToolbarState}
                    onPaste={handleEditorPaste}
                    placeholder="Tell your story..."
                >
                    <div
                        className={styles.editorToolbar}
                        onMouseDown={(event) => {
                            if (event.target.closest('button')) {
                                event.preventDefault();
                            } else {
                                saveEditorSelection();
                            }
                        }}
                    >
                        <button className={toolbarState.bold ? styles.activeEditorButton : ''} type="button" title="Bold" onClick={() => runEditorCommand('bold')}><strong>B</strong></button>
                        <button className={toolbarState.italic ? styles.activeEditorButton : ''} type="button" title="Italic" onClick={() => runEditorCommand('italic')}><em>I</em></button>
                        <button className={toolbarState.underline ? styles.activeEditorButton : ''} type="button" title="Underline" onClick={() => runEditorCommand('underline')}><u>U</u></button>
                        <button className={toolbarState.strikeThrough ? styles.activeEditorButton : ''} type="button" title="Strikethrough" onClick={() => runEditorCommand('strikeThrough')}><s>S</s></button>
                        <button type="button" title="Subscript" onClick={() => runEditorCommand('subscript')}>x<sub>2</sub></button>
                        <button type="button" title="Superscript" onClick={() => runEditorCommand('superscript')}>x<sup>2</sup></button>
                        <button className={toolbarState.unorderedList ? styles.activeEditorButton : ''} type="button" title="Bulleted list" onClick={() => runEditorCommand('insertUnorderedList')}>• list</button>
                        <button className={toolbarState.orderedList ? styles.activeEditorButton : ''} type="button" title="Numbered list" onClick={() => runEditorCommand('insertOrderedList')}>1. list</button>
                        <button className={toolbarState.blockquote ? styles.activeEditorButton : ''} type="button" title="Blockquote" onClick={() => runEditorCommand('formatBlock', 'BLOCKQUOTE')}>quote</button>
                        <button className={toolbarState.code ? styles.activeEditorButton : ''} type="button" title="Code block" onClick={() => runEditorCommand('formatBlock', 'PRE')}>code</button>
                        <button type="button" title="Horizontal rule" onClick={() => runEditorCommand('insertHorizontalRule')}>—</button>
                        <button type="button" title="Align left" onClick={() => runEditorCommand('justifyLeft')}>←</button>
                        <button type="button" title="Align center" onClick={() => runEditorCommand('justifyCenter')}>↔</button>
                        <button type="button" title="Align right" onClick={() => runEditorCommand('justifyRight')}>→</button>
                        <button type="button" title="Increase indent" onClick={() => runEditorCommand('indent')}>»</button>
                        <button type="button" title="Decrease indent" onClick={() => runEditorCommand('outdent')}>«</button>
                        <button type="button" title="Insert 3 by 3 table" onClick={insertTable}>table</button>
                        <button type="button" title="Add link" onClick={addEditorLink}>link</button>
                        <button type="button" title="Clear formatting" onClick={() => runEditorCommand('removeFormat')}>clear</button>
                        <button type="button" title="Undo" onClick={() => runEditorCommand('undo')}>undo</button>
                        <button type="button" title="Redo" onClick={() => runEditorCommand('redo')}>redo</button>
                        <select
                            title="Text style"
                            value={['DIV', 'H1', 'H2', 'H3'].includes(toolbarState.block) ? toolbarState.block : ''}
                            onChange={(event) => {
                                if (event.target.value) {
                                    runEditorCommand('formatBlock', event.target.value);
                                }
                            }}
                        >
                            <option value="" disabled>style</option>
                            <option value="DIV">Normal</option>
                            <option value="H1">Heading 1</option>
                            <option value="H2">Heading 2</option>
                            <option value="H3">Heading 3</option>
                            <option value="H4">Heading 4</option>
                            <option value="H5">Heading 5</option>
                            <option value="H6">Heading 6</option>
                        </select>
                        <label className={styles.colorControl} title="Text color">
                            <span aria-hidden="true">A</span>
                            <input
                                type="color"
                                aria-label="Text color"
                                defaultValue="#a6ffaA"
                                onMouseDown={saveEditorSelection}
                                onChange={(event) => runEditorCommandWithValue('foreColor', event)}
                            />
                        </label>
                        <label className={styles.colorControl} title="Highlight color">
                            <span aria-hidden="true">▰</span>
                            <input
                                type="color"
                                aria-label="Highlight color"
                                defaultValue="#173d2a"
                                onMouseDown={saveEditorSelection}
                                onChange={(event) => runEditorCommandWithValue('hiliteColor', event)}
                            />
                        </label>
                    </div>
                </RichTextEditor>
                <div className={styles.editorStatus} aria-live="polite">
                    <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                    <span>Shortcuts: Ctrl/Cmd+B, I, U, K</span>
                </div>
                {imageSelection && (
                    <div
                        className={styles.imageSelection}
                        style={{
                            left: imageSelection.left,
                            top: imageSelection.top,
                            width: imageSelection.width,
                            height: imageSelection.height,
                        }}
                        aria-hidden="true"
                    >
                        <button
                            type="button"
                            className={styles.imageResizeHandle}
                            onPointerDown={handleResizeStart}
                            aria-label="Resize selected image"
                        />
                    </div>
                )}
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

const WritePage = () => (
    <Suspense fallback={<div className={styles.loading}>Loading editor...</div>}>
        <WritePageContent />
    </Suspense>
);

export default WritePage;
