import { useSignal } from "@preact/signals";
import { toString } from "qrcode";

type QRCodeProps = {
  text: string;
  className?: string;
};

export const QRCode = ({ text, className }: QRCodeProps) => {
  const svgMarkup = useSignal("");
  toString(
    text,
    {
      type: "svg",
      errorCorrectionLevel: "low",
      margin: 1,
    },
    (_, svg) => (svgMarkup.value = svg || "")
  );
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgMarkup.value }}
    ></div>
  );
};
