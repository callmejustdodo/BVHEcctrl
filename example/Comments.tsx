import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEcctrlStore } from "../src/index";

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

/** Isolated input form — uses uncontrolled inputs (refs) so typing doesn't trigger R3F re-renders */
function CommentInput({
  position,
  onSubmit,
  onCancel,
}: {
  position: [number, number, number];
  onSubmit: (text: string, author: string) => void;
  onCancel: () => void;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authorRef.current) authorRef.current.value = getSavedAuthor();
    setTimeout(() => textRef.current?.focus(), 50);
  }, []);

  const submit = () => {
    const text = textRef.current?.value.trim() || "";
    if (!text) return;
    const author = authorRef.current?.value.trim() || "anonymous";
    setSavedAuthor(author);
    onSubmit(text, author);
  };

  return (
    <Html position={position} center style={{ pointerEvents: "auto" }}>
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
            ref={authorRef}
            defaultValue=""
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Your name"
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <textarea
          ref={textRef}
          defaultValue=""
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
            if (e.key === "Escape") onCancel();
            e.stopPropagation();
          }}
          placeholder="Write a comment..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={btnStyle("rgba(255,255,255,0.1)", "#999")}>
            Cancel
          </button>
          <button onClick={submit} style={btnStyle("#3b82f6")}>
            Post
          </button>
        </div>
      </div>
    </Html>
  );
}

/** Memoized marker — only re-renders when its own props change */
const CommentMarker = React.memo(function CommentMarker({
  comment,
  isExpanded,
  onExpand,
  onClose,
  onDelete,
}: {
  comment: Comment;
  isExpanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Html position={comment.position} center style={{ pointerEvents: "auto" }}>
      {isExpanded ? (
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
            <button onClick={onClose} style={btnStyle("rgba(255,255,255,0.1)", "#999")}>
              Close
            </button>
            <button onClick={onDelete} style={btnStyle("#dc2626")}>
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={onExpand}
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
  );
});

export default function Comments() {
  const pathname = window.location.pathname;
  const [comments, setComments] = useState<Comment[]>(() => loadComments(pathname));
  const [pendingPosition, setPendingPosition] = useState<[number, number, number] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const { camera, gl } = useThree();
  const colliderMeshesArray = useEcctrlStore((state) => state.colliderMeshesArray);
  const bvhMeshes = useMemo(
    () => colliderMeshesArray.filter((m) => m.geometry.boundsTree),
    [colliderMeshesArray]
  );

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

      raycasterRef.current.setFromCamera(mouse, camera);

      const intersects = raycasterRef.current.intersectObjects(bvhMeshes, false);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        setPendingPosition([point.x, point.y, point.z]);
        setExpandedId(null);
      }
    },
    [bvhMeshes, camera, gl]
  );

  useEffect(() => {
    gl.domElement.addEventListener("contextmenu", handleContextMenu);
    return () => gl.domElement.removeEventListener("contextmenu", handleContextMenu);
  }, [gl, handleContextMenu]);

  const handleSubmit = useCallback((text: string, author: string) => {
    if (!pendingPosition) return;
    const newComment: Comment = {
      id: crypto.randomUUID(),
      position: pendingPosition,
      text,
      author,
      createdAt: Date.now(),
    };
    setComments((prev) => [...prev, newComment]);
    setPendingPosition(null);
  }, [pendingPosition]);

  const handleDelete = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setExpandedId(null);
  }, []);

  const handleCancel = useCallback(() => {
    setPendingPosition(null);
  }, []);

  return (
    <>
      {pendingPosition && (
        <CommentInput
          position={pendingPosition}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {comments.map((comment) => (
        <CommentMarker
          key={comment.id}
          comment={comment}
          isExpanded={expandedId === comment.id}
          onExpand={() => setExpandedId(comment.id)}
          onClose={() => setExpandedId(null)}
          onDelete={() => handleDelete(comment.id)}
        />
      ))}
    </>
  );
}
