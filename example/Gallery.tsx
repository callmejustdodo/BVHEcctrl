import { useState } from "react";

const projects = [
  { id: "buildingA", title: "Building A", date: "2025/03/20", comments: 10, thumbnail: "/images/BuildingA.png" },
  { id: "buildingB", title: "Building B", date: "2025/03/18", comments: 5, thumbnail: "/images/BuildingB.png" },
  { id: "buildingC", title: "Building C", date: "2025/03/15", comments: 8, thumbnail: "/images/BuildingC.png" },
];

function ProjectCard({
  title,
  date,
  comments,
  href,
  thumbnail,
}: {
  title: string;
  date: string;
  comments: number;
  href: string;
  thumbnail: string;
}) {
  return (
    <a
      href={href}
      className="flex h-[526px] w-[388px] shrink-0 flex-col gap-[40px] rounded-[20px] border border-[#d4d2e3] bg-white pb-[32px] hover:shadow-lg transition-shadow"
    >
      <div className="flex h-[354px] w-full items-center justify-center overflow-hidden rounded-t-[20px] bg-[#f9f9ff]">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-[20px] px-[32px]">
        <div className="flex flex-col gap-[7px]">
          <h3 className="text-[28px] font-medium leading-[28px] text-black">
            {title}
          </h3>
          <p className="text-[18px] font-medium leading-[20px] text-[#625b71]">
            {date}
          </p>
        </div>
        <div className="flex items-center gap-[7px]">
          <img
            src="/images/chat-bubble.svg"
            alt=""
            className="size-[25px]"
          />
          <span className="text-[18px] font-medium leading-[24px] text-[#6750a4]">
            {comments}개의 댓글
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Gallery() {
  const [query, setQuery] = useState("");

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 z-10 flex h-[110px] w-full items-center bg-white px-[52px]">
        <div className="flex items-center gap-[30px]">
          <nav className="flex items-center gap-[20px] pr-[19px] text-[18px] leading-[30px] text-black">
            <span>로고</span>
            <span>건축 프로젝트</span>
          </nav>
          <div className="flex items-center gap-[300px] rounded-[50px] bg-[#f2f1fa] px-[24px] py-[13px]">
            <input
              type="text"
              placeholder="검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-[113px] bg-transparent text-[14px] font-medium leading-[20px] text-[#767494] placeholder-[#767494] outline-none"
            />
            <img
              src="/images/search-icon.svg"
              alt="search"
              className="size-[18px]"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-[1440px] max-w-full overflow-clip px-[110px] pt-[210px] pb-[100px]">
        {/* Title section */}
        <div className="mb-[70px] flex flex-col gap-[16px]">
          <h1 className="text-[36px] font-black leading-[44px] text-[#5d5a88]">
            리스트
          </h1>
          <p className="text-[18px] font-medium leading-[24px] text-[#9795b5]">
            설명
          </p>
        </div>

        {/* Card grid */}
        <div className="flex flex-col items-center gap-[50px]">
          {Array.from(
            { length: Math.ceil(filtered.length / 3) },
            (_, rowIdx) => (
              <div key={rowIdx} className="flex w-full gap-[28px]">
                {filtered
                  .slice(rowIdx * 3, rowIdx * 3 + 3)
                  .map((project, i) => (
                    <ProjectCard
                      key={`${rowIdx}-${i}`}
                      title={project.title}
                      date={project.date}
                      comments={project.comments}
                      href={`/${project.id}`}
                      thumbnail={project.thumbnail}
                    />
                  ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
