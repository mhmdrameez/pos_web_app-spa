import { useI18n } from "../i18n/context";

const QR_SIZE = 21;

function buildQrCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > QR_SIZE - 9 && y < 8) || (x < 8 && y > QR_SIZE - 9);
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (!inFinder(x, y) && rand() > 0.52) cells.push([x, y]);
    }
  }
  return cells;
}

const QR_CELLS = buildQrCells();

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" fill="#1d1a16" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="#1d1a16" />
    </g>
  );
}

// One path instead of hundreds of <rect> nodes: much less HTML and DOM.
const QR_PATH = QR_CELLS.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join("");

function SampleQr() {
  return (
    <svg
      className="qb-receipt__qr"
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect width={QR_SIZE} height={QR_SIZE} fill="#fff" />
      <path d={QR_PATH} fill="#1d1a16" />
      <Finder x={0} y={0} />
      <Finder x={QR_SIZE - 7} y={0} />
      <Finder x={0} y={QR_SIZE - 7} />
    </svg>
  );
}

type Props = {
  tilt?: boolean;
};

/** A sample thermal bill. Item names and labels follow the page language, like a real shop's printout. */
export default function Receipt({ tilt = false }: Props) {
  const { t } = useI18n();
  const r = t.receipt;
  const sum = (n: number) => n.toFixed(2);

  return (
    <figure className={`qb-receipt ${tilt ? "qb-receipt--tilt" : ""}`}>
      <div className="qb-receipt__paper">
        <p className="qb-receipt__shop">{r.shop}</p>
        <p className="qb-receipt__center">{r.gstin}</p>

        <div className="qb-receipt__rule" />
        <div className="qb-receipt__row">
          <span>{r.bill}</span>
          <span>{r.time}</span>
        </div>
        <div className="qb-receipt__rule" />

        {r.items.map((it) => (
          <div className="qb-receipt__row" key={it.name}>
            <span>{it.name}</span>
            <span>{it.price}</span>
          </div>
        ))}

        <div className="qb-receipt__rule" />
        <div className="qb-receipt__row">
          <span>{r.subtotal}</span>
          <span>{sum(400)}</span>
        </div>
        <div className="qb-receipt__row">
          <span>{r.cgst}</span>
          <span>{sum(10)}</span>
        </div>
        <div className="qb-receipt__row">
          <span>{r.sgst}</span>
          <span>{sum(10)}</span>
        </div>
        <div className="qb-receipt__row qb-receipt__total">
          <span>{r.total}</span>
          <span>₹{sum(420)}</span>
        </div>
        <div className="qb-receipt__rule" />

        <p className="qb-receipt__center">{r.scan}</p>
        <SampleQr />
        <p className="qb-receipt__center qb-receipt__sample">{r.thanks}</p>
      </div>
    </figure>
  );
}
