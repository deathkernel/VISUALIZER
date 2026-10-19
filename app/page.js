"use client";
import { useMemo, useState } from "react";
import { Sigma, Plus, Minus, X, Divide, Percent, Radical, Scale, Calculator, Shapes, ChartNoAxesCombined, RotateCcw, Activity } from "lucide-react";

const topics = [
 {id:"add",label:"Addition",group:"Arithmetic",Icon:Plus},
 {id:"subtract",label:"Subtraction",group:"Arithmetic",Icon:Minus},
 {id:"multiply",label:"Multiplication",group:"Arithmetic",Icon:X},
 {id:"divide",label:"Division",group:"Arithmetic",Icon:Divide},
 {id:"fraction",label:"Fractions",group:"Number skills",Icon:Sigma},
 {id:"percent",label:"Percentages",group:"Number skills",Icon:Percent},
 {id:"power",label:"Powers",group:"Number skills",Icon:Radical},
 {id:"root",label:"Square roots",group:"Number skills",Icon:Radical},
 {id:"ratio",label:"Ratios",group:"Number skills",Icon:Scale},
 {id:"average",label:"Average",group:"Number skills",Icon:ChartNoAxesCombined},
 {id:"algebra",label:"Linear equation",group:"Algebra",Icon:Calculator},
 {id:"geometry",label:"Area & perimeter",group:"Geometry",Icon:Shapes}
];
function NumberInput({label,value,onChange,min=-1000,max=1000,step=1}) {
 return <label className="number-field"><span>{label}</span><div className="number-control"><button type="button" onClick={()=>onChange(Math.max(min,Math.round((value-step)*100)/100))} aria-label={"Decrease "+label}>−</button><input type="number" min={min} max={max} step={step} value={value} onChange={e=>{if(e.target.value==="")return;const n=Number(e.target.value);if(Number.isFinite(n))onChange(Math.max(min,Math.min(max,n)));}}/><button type="button" onClick={()=>onChange(Math.min(max,Math.round((value+step)*100)/100))} aria-label={"Increase "+label}>+</button></div></label>
}
function Visual({topic,a,b,result}) {
 const max=Math.max(1,Math.abs(a),Math.abs(b),Math.abs(result));
 if(topic==="geometry") {
  const w=180,h= Math.max(25,180*(Math.abs(b)/Math.max(1,Math.abs(a))));
  return <svg viewBox="0 0 420 250" className="chart-svg" role="img" aria-label="Rectangle area and perimeter visualization"><rect x={210-w/2} y={125-h/2} width={w} height={h} rx="3" className="rectangle-fill" stroke="#a7b8ff" strokeWidth="2"/><text x="210" y={125-h/2-12} textAnchor="middle" className="point-label">Length = {a}</text><text x={210+w/2+12} y="129" className="point-label">Width = {b}</text><text x="210" y="235" textAnchor="middle" className="plot-caption">Rectangle (not to scale)</text></svg>
 }
 const bar=(n,y,color,label)=><g key={label}><rect x="70" y={y} width={Math.max(3,260*Math.abs(n)/max)} height="30" rx="5" fill={color}/><text x="60" y={y+20} textAnchor="end" className="axis-label">{label}</text><text x={Math.min(355,78+260*Math.abs(n)/max)} y={y+20} className="point-label">{n}</text></g>;
 return <svg viewBox="0 0 420 200" className="chart-svg" role="img" aria-label={"Visual comparison for "+topic}><line x1="70" y1="20" x2="70" y2="170" className="axis-line"/>{bar(a,28,"#a7b8ff","A")}{bar(b,78,"#9bd7d0","B")}{bar(result,128,"#e8c38d","Result")}</svg>
}
export default function Home(){
 const [topic,setTopic]=useState("add"),[a,setA]=useState(12),[b,setB]=useState(4),[c,setC]=useState(3);
 const active=topics.find(t=>t.id===topic);
 const calculation=useMemo(()=>{
  const safeB=b===0?1:b;
  if(topic==="add")return {formula:`${a} + ${b}`,answer:a+b,steps:[`Start with ${a}.`,`Add ${b} more.`,`Total: ${a} + ${b} = ${a+b}.`],note:"Combine both amounts."};
  if(topic==="subtract")return {formula:`${a} − ${b}`,answer:a-b,steps:[`Start with ${a}.`,`Take away ${b}.`,`Difference: ${a} − ${b} = ${a-b}.`],note:"Find the difference."};
  if(topic==="multiply")return {formula:`${a} × ${b}`,answer:a*b,steps:[`Make ${a} equal groups.`,`Put ${b} items in each group.`,`Total: ${a} × ${b} = ${a*b}.`],note:"Multiplication is repeated addition."};
  if(topic==="divide")return {formula:`${a} ÷ ${safeB}`,answer:(a/safeB).toFixed(2).replace(/\.00$/,""),steps:[`Start with ${a} items.`,`Split them into ${safeB} equal groups.`,`Each group gets ${a/safeB}.`],note:b===0?"Division by zero is undefined.":"Share equally between groups."};
  if(topic==="fraction"){const g=(x,y)=>y?g(y,x%y):Math.abs(x);const d=g(Math.round(a),Math.round(safeB))||1;return {formula:`${Math.round(a)}/${Math.round(safeB)}`,answer:`${Math.round(a)/d}/${Math.round(safeB)/d}`,steps:[`Numerator = ${Math.round(a)}; denominator = ${Math.round(safeB)}.`,`Find the greatest common divisor: ${d}.`,`Simplify both parts by ${d}: ${Math.round(a)/d}/${Math.round(safeB)/d}.`],note:"A fraction represents parts of a whole."};}
  if(topic==="percent")return {formula:`${b}% of ${a}`,answer:(a*b/100).toFixed(2).replace(/\.00$/,""),steps:[`Convert ${b}% to a decimal: ${b}/100 = ${b/100}.`,`Multiply by the whole: ${a} × ${b/100}.`,`Answer: ${a} × ${b}/100 = ${a*b/100}.`],note:"Percent means per hundred."};
  if(topic==="power")return {formula:`${a}^${Math.max(0,Math.min(8,Math.round(b))) }`,answer:Math.pow(a,Math.max(0,Math.min(8,Math.round(b)))),steps:[`Base = ${a}; exponent = ${Math.max(0,Math.min(8,Math.round(b)))}.`,`Multiply the base by itself ${Math.max(0,Math.min(8,Math.round(b)))} times.`,`Power = ${Math.pow(a,Math.max(0,Math.min(8,Math.round(b))))}.`],note:"The exponent tells how many factors to multiply."};
  if(topic==="root"){const n=Math.max(0,a);return {formula:`√${n}`,answer:Math.sqrt(n).toFixed(3).replace(/0+$/,"").replace(/\.$/,""),steps:[`Find a number that multiplied by itself gives ${n}.`,`Check: √${n} × √${n} = ${n}.`,`Square root ≈ ${Math.sqrt(n).toFixed(3)}.`],note:"Only non-negative inputs are used for real square roots."};}
  if(topic==="ratio"){const g=(x,y)=>y?g(y,x%y):Math.abs(x);const d=g(Math.round(a),Math.round(safeB))||1;return {formula:`${Math.round(a)} : ${Math.round(safeB)}`,answer:`${Math.round(a)/d} : ${Math.round(safeB)/d}`,steps:[`Write the ratio as ${Math.round(a)} : ${Math.round(safeB)}.`,`Find the greatest common divisor: ${d}.`,`Divide both terms by ${d} to simplify.`],note:"Ratios compare two quantities."};}
  if(topic==="average"){const sum=a+b+c;return {formula:`(${a} + ${b} + ${c}) ÷ 3`,answer:(sum/3).toFixed(2).replace(/\.00$/,""),steps:[`Add the values: ${a} + ${b} + ${c} = ${sum}.`,`There are 3 values.`,`Mean = ${sum} ÷ 3 = ${sum/3}.`],note:"Average = sum of values ÷ number of values."};}
  if(topic==="algebra"){const x=(c-a)/safeB;return {formula:`${b}x + ${a} = ${c}`,answer:`x = ${x.toFixed(3).replace(/0+$/,"").replace(/\.$/,"")}`,steps:[`Equation: ${b}x + ${a} = ${c}.`,`Subtract ${a} from both sides: ${b}x = ${c-a}.`,`Divide by ${safeB}: x = ${x}.`],note:b===0?"Coefficient cannot be zero for this solver.":"Do the same operation on both sides."};}
  const area=Math.abs(a*b),perimeter=2*(Math.abs(a)+Math.abs(b));return {formula:`Area = ${a} × ${b}`,answer:`${area} area units · ${perimeter} perimeter units`,steps:[`Length = ${a}; width = ${b}.`,`Area = length × width = ${area}.`,`Perimeter = 2 × (length + width) = ${perimeter}.`],note:"Area measures the inside; perimeter measures the boundary."};
 },[topic,a,b,c]);
 function reset(){setA(12);setB(4);setC(3)}
 const showC=topic==="average"||topic==="algebra";
 const aLabel=topic==="root"?"Number":topic==="geometry"?"Length":topic==="average"?"Value 1":topic==="algebra"?"Constant (a)":"First value";
 const bLabel=topic==="percent"?"Percent":topic==="algebra"?"Coefficient (b)":topic==="geometry"?"Width":topic==="average"?"Value 2":topic==="power"?"Exponent":topic==="fraction"?"Denominator":topic==="ratio"?"Second term":"Second value";
 return <main className="app-shell">
  <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Sigma size={20}/></span><span><strong>MATHS<span className="brand-accent">LAB</span></strong><small>INTERACTIVE MATHS STUDIO</small></span></a><div className="top-status"><span className="status-light"/> CALCULATIONS LIVE <span className="top-divider"/><span>LOCAL MATHS</span></div></header>
  <section className="hero"><div><div className="eyebrow">LEARN BY SEEING</div><h1>Every sum, <span>made clearer.</span></h1><p>Choose a topic, change the numbers, and follow the solution step by step.</p></div></section>
  <section className="topic-section"><div className="topic-heading"><div><span className="section-kicker">EXPLORE TOPICS</span><h2>What do you want to solve?</h2></div><span className="topic-count">12 TOPICS</span></div><div className="topic-grid">{topics.map(({id,label,group,Icon})=><button key={id} onClick={()=>setTopic(id)} className={topic===id?"topic-choice selected":"topic-choice"}><span className="topic-icon"><Icon size={17}/></span><span className="topic-name">{label}</span><span className="topic-arrow">↗</span></button>)}</div></section>
  <div className="workspace"><section className="card controls-card"><div className="card-heading"><div><span className="section-kicker">01 / INPUT</span><h2>{active.label}</h2></div><button className="reset-button" onClick={reset}><RotateCcw size={13}/> Reset</button></div>
   <div className="input-stack"><NumberInput label={aLabel} value={a} onChange={setA} min={topic==="root"?0:-1000} max={1000}/><NumberInput label={bLabel} value={b} onChange={setB} min={topic==="fraction"||topic==="ratio"||topic==="divide"||topic==="percent"?1:-100} max={1000} step={topic==="percent"?.5:1}/>{showC&&<NumberInput label={topic==="average"?"Value 3":"Right-hand side (c)"} value={c} onChange={setC}/>}</div>
   <div className="formula-preview"><span>FORMULA</span><strong>{calculation.formula}</strong><div className="answer-line"><span>ANSWER</span><b>{calculation.answer}</b></div></div><p className="hint-text">{calculation.note}</p>
  </section><section className="card visualization-card"><div className="card-heading"><div><span className="section-kicker">02 / VISUAL</span><h2>{active.label} visualizer</h2></div><span className="live-badge"><Activity size={12}/> LIVE</span></div><div className="plot-area"><Visual topic={topic} a={a} b={b} result={calculation.answer}/></div><div className="plot-legend"><span><i className="legend-dot primary"/>{topic==="geometry"?"Shape preview":"Value comparison"}</span><span className="legend-right">UPDATES WITH INPUT</span></div></section></div>
  <section className="card solution-card"><div className="card-heading"><div><span className="section-kicker">03 / UNDERSTAND</span><h2>Step-by-step solution</h2></div><span className="steps-count">3 STEPS</span></div><div className="solution-steps">{calculation.steps.map((step,i)=><div className="solution-step" key={i}><span className="step-number">{String(i+1).padStart(2,"0")}</span><p>{step}</p>{i===2&&<span className="done-mark">✓</span>}</div>)}</div></section>
  <footer className="app-footer"><span><span className="footer-mark">∑</span> MATHSLAB <span className="footer-muted">· Learn visually, one problem at a time.</span></span><span>CLIENT-SIDE CALCULATIONS <span className="footer-dot">●</span></span></footer>
 </main>
}
