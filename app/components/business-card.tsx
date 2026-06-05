"use client";

import NextImage from "next/image";
import { ChangeEvent, useMemo, useRef, useState } from "react";

import styles from "./business-card.module.scss";

type ContactKey = "email" | "qq" | "wechat";
type TemplateKey = "aurora" | "ink" | "jade" | "minimal";

type UploadedImage = {
  name: string;
  src: string;
};

type CustomText = {
  id: number;
  text: string;
  size: number;
  color: string;
};

const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;

const templates: Record<
  TemplateKey,
  {
    name: string;
    description: string;
    background: string;
    accent: string;
    muted: string;
    text: string;
  }
> = {
  aurora: {
    name: "极光商务",
    description: "渐变、现代、科技感",
    background: "#102a43",
    accent: "#2dd4bf",
    muted: "#d9f99d",
    text: "#ffffff",
  },
  ink: {
    name: "黑金专业",
    description: "高端、稳重、顾问风",
    background: "#171717",
    accent: "#d6a84f",
    muted: "#f5e6c8",
    text: "#ffffff",
  },
  jade: {
    name: "青绿品牌",
    description: "清爽、产品、服务型",
    background: "#f0fdfa",
    accent: "#0f766e",
    muted: "#115e59",
    text: "#083344",
  },
  minimal: {
    name: "极简留白",
    description: "干净、通用、可印刷",
    background: "#ffffff",
    accent: "#2563eb",
    muted: "#64748b",
    text: "#0f172a",
  },
};

const contactLabels: Record<ContactKey, string> = {
  email: "邮箱",
  qq: "QQ",
  wechat: "微信号",
};

const fontFamilies = [
  "Inter, Arial, sans-serif",
  "'PingFang SC', 'Microsoft YaHei', sans-serif",
  "Georgia, 'Times New Roman', serif",
  "'Courier New', monospace",
];

function wrapText(value: string, maxLength: number) {
  const source = value || "";
  const lines = source.split(/\n/g).flatMap((line) => {
    if (!line) return [""];
    const result: string[] = [];
    for (let index = 0; index < line.length; index += maxLength) {
      result.push(line.slice(index, index + maxLength));
    }
    return result;
  });

  return lines.slice(0, 6);
}

function readImage(file: File): Promise<UploadedImage> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ name: file.name, src: String(reader.result ?? "") });
    reader.readAsDataURL(file);
  });
}

function UploadCard(props: {
  title: string;
  hint: string;
  image?: UploadedImage | null;
  multiple?: boolean;
  onUpload: (files: FileList) => void;
}) {
  return (
    <label className={styles["upload-card"]}>
      {props.image ? (
        <NextImage
          src={props.image.src}
          alt={props.title}
          width={140}
          height={92}
          unoptimized
        />
      ) : (
        <span className={styles["upload-placeholder"]}>
          <strong>{props.title}</strong>
          <small>{props.hint}</small>
        </span>
      )}
      <input
        type="file"
        accept="image/*"
        multiple={props.multiple}
        onChange={(event) => {
          if (event.target.files?.length) {
            props.onUpload(event.target.files);
          }
          event.target.value = "";
        }}
      />
    </label>
  );
}

export function BusinessCard() {
  const [template, setTemplate] = useState<TemplateKey>("aurora");
  const [companyCn, setCompanyCn] = useState("星河智能科技有限公司");
  const [companyEn, setCompanyEn] = useState("Galaxy Intelligence Co., Ltd.");
  const [name, setName] = useState("张明");
  const [title, setTitle] = useState("品牌增长顾问");
  const [phone, setPhone] = useState("138 0000 0000");
  const [email, setEmail] = useState("hello@example.com");
  const [qq, setQq] = useState("88888888");
  const [wechat, setWechat] = useState("wechat_id");
  const [contacts, setContacts] = useState<ContactKey[]>(["email", "wechat"]);
  const [backIntro, setBackIntro] = useState(
    "专注企业数字化名片、品牌视觉与产品展示方案。可在这里自由填写公司介绍、服务范围、产品亮点或合作说明。",
  );
  const [fontFamily, setFontFamily] = useState(fontFamilies[1]);
  const [fontSize, setFontSize] = useState(34);
  const [textColor, setTextColor] = useState("#ffffff");
  const [companyLogo, setCompanyLogo] = useState<UploadedImage | null>(null);
  const [wechatQr, setWechatQr] = useState<UploadedImage | null>(null);
  const [productLogos, setProductLogos] = useState<UploadedImage[]>([]);
  const [customTexts, setCustomTexts] = useState<CustomText[]>([
    {
      id: Date.now(),
      text: "核心产品 · 专业服务 · 长期合作",
      size: 24,
      color: "#ffffff",
    },
  ]);
  const [generatedAt, setGeneratedAt] = useState<string>();
  const frontSvgRef = useRef<SVGSVGElement | null>(null);
  const backSvgRef = useRef<SVGSVGElement | null>(null);

  const palette = templates[template];
  const activeTextColor = textColor || palette.text;

  const contactValues: Record<ContactKey, string> = {
    email,
    qq,
    wechat,
  };

  const shownContacts = contacts.filter((key) => contactValues[key].trim());

  const companyDisplay = useMemo(
    () => [companyCn, companyEn].filter(Boolean),
    [companyCn, companyEn],
  );

  const uploadSingle = async (
    files: FileList,
    setter: (image: UploadedImage) => void,
  ) => {
    setter(await readImage(files[0]));
  };

  const uploadProducts = async (files: FileList) => {
    const images = await Promise.all(Array.from(files).map(readImage));
    setProductLogos((current) => [...current, ...images].slice(0, 8));
  };

  const toggleContact = (key: ContactKey) => {
    setContacts((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const serializeSvg = (node: SVGSVGElement | null) => {
    if (!node) return "";
    return new XMLSerializer().serializeToString(node);
  };

  const downloadSvg = (node: SVGSVGElement | null, filename: string) => {
    const svg = serializeSvg(node);
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = (node: SVGSVGElement | null, filename: string) => {
    const svg = serializeSvg(node);
    if (!svg) return;
    const image = new Image();
    const url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = filename;
      link.click();
    };
    image.src = url;
  };

  const generateCards = () => {
    setGeneratedAt(new Date().toLocaleString());
    downloadPng(frontSvgRef.current, "business-card-front.png");
    downloadPng(backSvgRef.current, "business-card-back.png");
  };

  const renderBackground = () => (
    <>
      <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill={palette.background} />
      <circle cx="900" cy="80" r="220" fill={palette.accent} opacity="0.18" />
      <circle cx="90" cy="540" r="180" fill={palette.muted} opacity="0.16" />
      <path
        d="M0 470 C260 360 420 560 680 420 S920 270 1050 330 L1050 600 L0 600 Z"
        fill={palette.accent}
        opacity={template === "minimal" ? 0.06 : 0.16}
      />
    </>
  );

  return (
    <main className={styles["business-card-page"]}>
      <header className={styles.header}>
        <div>
          <h1>专业名片制作工具</h1>
          <p>
            上传公司
            LOGO、微信二维码，自由填写中英文公司名、联系方式、背面介绍与产品
            LOGO，并实时生成正反面名片。
          </p>
        </div>
        <div className={styles["header-actions"]}>
          <button className={styles["primary-button"]} onClick={generateCards}>
            生成并下载名片
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel}>
          <div className={styles.section}>
            <h2>模板选择</h2>
            <div className={styles["template-grid"]}>
              {(Object.keys(templates) as TemplateKey[]).map((key) => (
                <button
                  key={key}
                  className={`${styles["template-card"]} ${
                    template === key ? styles["active-template"] : ""
                  }`}
                  onClick={() => setTemplate(key)}
                >
                  <strong>{templates[key].name}</strong>
                  <small>{templates[key].description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2>LOGO / 微信二维码</h2>
            <div className={styles["logo-grid"]}>
              <UploadCard
                title="上传公司 LOGO"
                hint="自动显示在名片正面"
                image={companyLogo}
                onUpload={(files) => uploadSingle(files, setCompanyLogo)}
              />
              <UploadCard
                title="上传微信二维码"
                hint="客户扫码即可添加微信"
                image={wechatQr}
                onUpload={(files) => uploadSingle(files, setWechatQr)}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>基础信息</h2>
            <label className={styles.field}>
              <span>公司中文名（可留空）</span>
              <input
                value={companyCn}
                onChange={(e) => setCompanyCn(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>公司英文名（可留空）</span>
              <input
                value={companyEn}
                onChange={(e) => setCompanyEn(e.target.value)}
              />
            </label>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>姓名</span>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span>职位</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span>手机号</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>

          <div className={styles.section}>
            <h2>联系方式（可单选或多选显示）</h2>
            <div className={styles["checkbox-list"]}>
              {(Object.keys(contactLabels) as ContactKey[]).map((key) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={contacts.includes(key)}
                    onChange={() => toggleContact(key)}
                  />
                  {contactLabels[key]}
                </label>
              ))}
            </div>
            <label className={styles.field}>
              <span>邮箱</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>QQ</span>
                <input value={qq} onChange={(e) => setQq(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span>微信号</span>
                <input
                  value={wechat}
                  onChange={(e) => setWechat(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h2>文字样式</h2>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>字体</span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font.split(",")[0].replaceAll("'", "")}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>字号：{fontSize}px</span>
                <input
                  type="range"
                  min="24"
                  max="54"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </label>
              <label className={styles.field}>
                <span>文字颜色</span>
                <input
                  type="color"
                  value={activeTextColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h2>名片反面</h2>
            <label className={styles.field}>
              <span>介绍文案</span>
              <textarea
                value={backIntro}
                onChange={(e) => setBackIntro(e.target.value)}
              />
            </label>
            <UploadCard
              title="上传产品 LOGO"
              hint="可多选，最多展示 8 个"
              multiple
              onUpload={uploadProducts}
            />
            <div className={styles["product-list"]}>
              {productLogos.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className={styles["product-item"]}
                >
                  <NextImage
                    src={logo.src}
                    alt={logo.name}
                    width={42}
                    height={42}
                    unoptimized
                  />
                  <span>{logo.name}</span>
                  <button
                    className={styles["danger-button"]}
                    onClick={() =>
                      setProductLogos((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2>自由添加文字</h2>
            <div className={styles["custom-list"]}>
              {customTexts.map((item) => (
                <div key={item.id} className={styles["custom-item"]}>
                  <label className={styles.field}>
                    <span>内容</span>
                    <input
                      value={item.text}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setCustomTexts((current) =>
                          current.map((custom) =>
                            custom.id === item.id
                              ? { ...custom, text: event.target.value }
                              : custom,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>字号</span>
                    <input
                      type="number"
                      min="14"
                      max="44"
                      value={item.size}
                      onChange={(event) =>
                        setCustomTexts((current) =>
                          current.map((custom) =>
                            custom.id === item.id
                              ? { ...custom, size: Number(event.target.value) }
                              : custom,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>颜色</span>
                    <input
                      type="color"
                      value={item.color}
                      onChange={(event) =>
                        setCustomTexts((current) =>
                          current.map((custom) =>
                            custom.id === item.id
                              ? { ...custom, color: event.target.value }
                              : custom,
                          ),
                        )
                      }
                    />
                  </label>
                  <button
                    className={styles["danger-button"]}
                    onClick={() =>
                      setCustomTexts((current) =>
                        current.filter((custom) => custom.id !== item.id),
                      )
                    }
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            <button
              className={styles["secondary-button"]}
              onClick={() =>
                setCustomTexts((current) => [
                  ...current,
                  {
                    id: Date.now(),
                    text: "新的自定义文字",
                    size: 22,
                    color: activeTextColor,
                  },
                ])
              }
            >
              + 添加一行文字
            </button>
          </div>
        </section>

        <section className={styles["preview-panel"]}>
          <div className={styles["preview-grid"]}>
            <div className={styles["preview-card"]}>
              <h3>正面预览</h3>
              <svg
                ref={frontSvgRef}
                viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
                xmlns="http://www.w3.org/2000/svg"
              >
                {renderBackground()}
                <rect
                  x="56"
                  y="52"
                  width="938"
                  height="496"
                  rx="34"
                  fill="none"
                  stroke={palette.accent}
                  opacity="0.34"
                  strokeWidth="3"
                />
                {companyLogo ? (
                  <image
                    href={companyLogo.src}
                    x="74"
                    y="72"
                    width="130"
                    height="130"
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  <rect
                    x="74"
                    y="72"
                    width="130"
                    height="130"
                    rx="22"
                    fill={palette.accent}
                    opacity="0.24"
                  />
                )}
                <text
                  x="230"
                  y="104"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize="30"
                  fontWeight="700"
                >
                  {companyDisplay[0] ?? "公司名称"}
                </text>
                <text
                  x="230"
                  y="148"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize="22"
                  opacity="0.72"
                >
                  {companyDisplay[1] ?? "Company Name"}
                </text>
                <line
                  x1="74"
                  y1="240"
                  x2="930"
                  y2="240"
                  stroke={palette.accent}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text
                  x="74"
                  y="330"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  fontWeight="800"
                >
                  {name || "姓名"}
                </text>
                <text
                  x="74"
                  y="380"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize="26"
                  opacity="0.78"
                >
                  {title || "职位"}
                </text>
                <text
                  x="74"
                  y="448"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize="24"
                >
                  电话：{phone || "-"}
                </text>
                {shownContacts.map((key, index) => (
                  <text
                    key={key}
                    x="74"
                    y={492 + index * 34}
                    fill={activeTextColor}
                    fontFamily={fontFamily}
                    fontSize="22"
                    opacity="0.9"
                  >
                    {contactLabels[key]}：{contactValues[key]}
                  </text>
                ))}
                {wechatQr ? (
                  <>
                    <rect
                      x="806"
                      y="332"
                      width="138"
                      height="138"
                      rx="18"
                      fill="#ffffff"
                    />
                    <image
                      href={wechatQr.src}
                      x="816"
                      y="342"
                      width="118"
                      height="118"
                      preserveAspectRatio="xMidYMid meet"
                    />
                    <text
                      x="875"
                      y="502"
                      fill={activeTextColor}
                      textAnchor="middle"
                      fontFamily={fontFamily}
                      fontSize="20"
                    >
                      扫码加微信
                    </text>
                  </>
                ) : null}
                {customTexts.slice(0, 3).map((item, index) => (
                  <text
                    key={item.id}
                    x="650"
                    y={210 + index * 40}
                    fill={item.color}
                    fontFamily={fontFamily}
                    fontSize={item.size}
                    textAnchor="middle"
                  >
                    {item.text}
                  </text>
                ))}
              </svg>
            </div>

            <div className={styles["preview-card"]}>
              <h3>反面预览</h3>
              <svg
                ref={backSvgRef}
                viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
                xmlns="http://www.w3.org/2000/svg"
              >
                {renderBackground()}
                <text
                  x="74"
                  y="108"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize="38"
                  fontWeight="800"
                >
                  {companyCn || companyEn || "公司介绍"}
                </text>
                <text
                  x="74"
                  y="160"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize="26"
                >
                  {wrapText(backIntro, 24).map((line, index) => (
                    <tspan
                      key={`${line}-${index}`}
                      x="74"
                      dy={index === 0 ? 0 : 40}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
                <rect
                  x="734"
                  y="92"
                  width="190"
                  height="190"
                  rx="30"
                  fill={palette.accent}
                  opacity="0.16"
                />
                {wechatQr ? (
                  <image
                    href={wechatQr.src}
                    x="764"
                    y="122"
                    width="130"
                    height="130"
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  <text
                    x="829"
                    y="194"
                    fill={activeTextColor}
                    fontFamily={fontFamily}
                    fontSize="24"
                    textAnchor="middle"
                  >
                    微信二维码
                  </text>
                )}
                <text
                  x="74"
                  y="430"
                  fill={activeTextColor}
                  fontFamily={fontFamily}
                  fontSize="26"
                  fontWeight="700"
                >
                  产品 / 品牌 LOGO
                </text>
                {productLogos.slice(0, 8).map((logo, index) => {
                  const x = 74 + (index % 4) * 150;
                  const y = 456 + Math.floor(index / 4) * 74;
                  return (
                    <g key={`${logo.name}-${index}`}>
                      <rect
                        x={x}
                        y={y}
                        width="112"
                        height="54"
                        rx="14"
                        fill="#ffffff"
                        opacity="0.92"
                      />
                      <image
                        href={logo.src}
                        x={x + 10}
                        y={y + 8}
                        width="92"
                        height="38"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className={styles["preview-actions"]}>
            <button
              className={styles["primary-button"]}
              onClick={generateCards}
            >
              生成 PNG
            </button>
            <button
              className={styles["secondary-button"]}
              onClick={() =>
                downloadSvg(frontSvgRef.current, "business-card-front.svg")
              }
            >
              下载正面 SVG
            </button>
            <button
              className={styles["secondary-button"]}
              onClick={() =>
                downloadSvg(backSvgRef.current, "business-card-back.svg")
              }
            >
              下载反面 SVG
            </button>
          </div>
          {generatedAt ? (
            <div className={styles["generated-box"]}>
              已在 {generatedAt}{" "}
              生成下载文件。提示：微信二维码请上传个人微信「二维码名片」图片，客户扫描后即可添加微信。
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
