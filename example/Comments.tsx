import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

interface Comment {
  id: string;
  position: [number, number, number];
  text: string;
  author: string;
  createdAt: number;
}

const STORAGE_KEY = "bvhecctrl-comments";
const AUTHOR_KEY = "bvhecctrl-author";

function loadComments(pathname: string): Comment[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${pathname}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComments(pathname: string, comments: Comment[]) {
  localStorage.setItem(`${STORAGE_KEY}:${pathname}`, JSON.stringify(comments));
}

function getSavedAuthor(): string {
  return localStorage.getItem(AUTHOR_KEY) || "anonymous";
}

function setSavedAuthor(name: string) {
  localStorage.setItem(AUTHOR_KEY, name);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function Comments() {
  const pathname = window.location.pathname;
  const [comments, setComments] = useState<Comment[]>(() => loadComments(pathname));
  const [pendingPosition, setPendingPosition] = useState<[number, number, number] | null>(null);
  const [inputText, setInputText] = useState("");
  const [authorName, setAuthorName] = useState(getSavedAuthor);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    saveComments(pathname, comments);
  }, [comments, pathname]);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        setPendingPosition([point.x, point.y, point.z]);
        setInputText("");
        setExpandedId(null);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [scene, camera, gl]
  );

  useEffect(() => {
    gl.domElement.addEventListener("contextmenu", handleContextMenu);
    return () => gl.domElement.removeEventListener("contextmenu", handleContextMenu);
  }, [gl, handleContextMenu]);

  const submitComment = () => {
    if (!inputText.trim() || !pendingPosition) return;
    const author = authorName.trim() || "anonymous";
    setSavedAuthor(author);
    const newComment: Comment = {
      id: crypto.randomUUID(),
      position: pendingPosition,
      text: inputText.trim(),
      author,
      createdAt: Date.now(),
    };
    setComments((prev) => [...prev, newComment]);
    setPendingPosition(null);
    setInputText("");
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setExpandedId(null);
  };

  const cancelInput = () => {
    setPendingPosition(null);
    setInputText("");
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 6,
    color: "#fff",
    padding: "6px 10px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  };

  const btnStyle = (bg: string, color = "#fff"): React.CSSProperties => ({
    background: bg,
    border: "none",
    borderRadius: 6,
    color,
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    transition: "opacity 0.15s",
  });

  return (
    <>
      {pendingPosition && (
        <Html position={pendingPosition} center style={{ pointerEvents: "auto" }}>
          <div
            style={{
              background: "rgba(15,15,20,0.92)",
              backdropFilter: "blur(12px)",
              borderRadius: 12,
              padding: 14,
              width: 260,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Your name"
                style={{ ...inputStyle, width: "100%" }}
              />
            </div>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); }
                if (e.key === "Escape") cancelInput();
                e.stopPropagation();
              }}
              placeholder="Write a comment..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={cancelInput} style={btnStyle("rgba(255,255,255,0.1)", "#999")}>
                Cancel
              </button>
              <button onClick={submitComment} style={btnStyle("#3b82f6")}>
                Post
              </button>
            </div>
          </div>
        </Html>
      )}

      {comments.map((comment) => (
        <Html key={comment.id} position={comment.position} center style={{ pointerEvents: "auto" }}>
          {expandedId === comment.id ? (
            <div
              style={{
                background: "rgba(15,15,20,0.92)",
                backdropFilter: "blur(12px)",
                borderRadius: 12,
                padding: 14,
                color: "#fff",
                fontSize: 13,
                width: 240,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: "#93c5fd" }}>{comment.author}</span>
                <span style={{ fontSize: 11, color: "#666" }}>{formatTime(comment.createdAt)}</span>
              </div>
              <div style={{ lineHeight: 1.5, marginBottom: 12, wordBreak: "break-word", color: "#e2e2e2" }}>
                {comment.text}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setExpandedId(null)} style={btnStyle("rgba(255,255,255,0.1)", "#999")}>
                  Close
                </button>
                <button onClick={() => deleteComment(comment.id)} style={btnStyle("#dc2626")}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setExpandedId(comment.id)}
              title={`${comment.author}: ${comment.text}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#3b82f6",
                border: "2px solid rgba(255,255,255,0.9)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 12px rgba(59,130,246,0.5)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          )}
        </Html>
      ))}
    </>
  );
}
