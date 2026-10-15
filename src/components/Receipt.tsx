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

function SampleQr() {
  return (
    <svg
      className="qb-receipt__qr"
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect width={QR_SIZE} height={QR_SIZE} fill="#fff" />
      {QR_CELLS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1d1a16" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={QR_SIZE - 7} y={0} />
      <Finder x={0} y={QR_SIZE - 7} />
    </svg>
  );
}

type Props = {
  tilt?: boolean;
};

export default function Receipt({ tilt = false }: Props) {
  return (
    <figure className={`qb-receipt ${tilt ? "qb-receipt--tilt" : ""}`}>
      <div className="qb-receipt__paper">
        <p className="qb-receipt__shop">YOUR SHOP NAME</p>
        <p className="qb-receipt__center">GSTIN 29XXXXX0000X1ZX</p>

        <div className="qb-receipt__rule" />
        <div className="qb-receipt__row">
          <span>Bill #0042</span>
          <span>12:20 PM</span>
        </div>
        <div className="qb-receipt__rule" />

        <div className="qb-receipt__row">
          <span>Tea powder 250g</span>
          <span>120.00</span>
        </div>
        <div className="qb-receipt__row">
          <span>Sugar 2 kg</span>
          <span>90.00</span>
        </div>
        <div className="qb-receipt__row">
          <span>Atta 5 kg</span>
          <span>190.00</span>
        </div>

        <div className="qb-receipt__rule" />
        <div className="qb-receipt__row">
          <span>Subtotal</span>
          <span>400.00</span>
        </div>
        <div className="qb-receipt__row">
          <span>CGST 2.5%</span>
          <span>10.00</span>
        </div>
        <div className="qb-receipt__row">
          <span>SGST 2.5%</span>
          <span>10.00</span>
        </div>
        <div className="qb-receipt__row qb-receipt__total">
          <span>TOTAL</span>
          <span>₹420.00</span>
        </div>
        <div className="qb-receipt__rule" />

        <p className="qb-receipt__center">Scan to pay by UPI</p>
        <SampleQr />
        <p className="qb-receipt__center qb-receipt__sample">Thank you · sample bill</p>
      </div>
    </figure>
  );
}
