import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { toString } from "qrcode";

type QRCodeProps = {
  text: string;
  className?: string;
};

export const QRCode = ({ text, className }: QRCodeProps) => {
  const ref = createRef();
  useEffect(() => {
    toString(
      text,
      {
        type: "svg",
        errorCorrectionLevel: "low",
        color: { dark: "#ffffffff", light: "#000000ff" },
      },
      (_, svg) => {
        if (svg === undefined) {
          ref.current.innerHTML = "";
          return;
        }
        ref.current.innerHTML = svg;
      }
    );
  }, [text]);
  return <div ref={ref} className={className}></div>;
};
