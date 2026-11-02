/* ===== Conocimientos vol. 2: elementos visuales extra =====
   1) Imágenes que aparecen con cortina y se amplían con clic.
   2) Índice lateral que marca la sección actual.
   3) Laboratorios interactivos: <div class="kb-lab vz-lab" data-viz="..."></div>
   No modifica ni quita contenido existente. */
(function(){
"use strict";
var G=["#00C2FF","#C13CFF","#19E36B","#F2E814"],INK="#1f2430",DIM="#6b7280",GRID="#eef1f6";
function clamp(v,a,b){return v<a?a:v>b?b:v}
function fmt(n,d){return Number(n).toLocaleString("es-MX",{minimumFractionDigits:d||0,maximumFractionDigits:d||0})}
function erf(x){var s=x<0?-1:1;x=Math.abs(x);var t=1/(1+.3275911*x),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return s*y}
function Phi(z){return .5*(1+erf(z/Math.SQRT2))}
function pdf(x,m,s){return Math.exp(-.5*Math.pow((x-m)/s,2))/(s*Math.sqrt(2*Math.PI))}

/* ---------- 1) Imágenes ---------- */
var zoom=document.createElement("div");zoom.className="vz-zoom";zoom.innerHTML="<b>×</b><img alt=''><p></p>";document.body.appendChild(zoom);
zoom.addEventListener("click",function(){zoom.classList.remove("on")});
addEventListener("keydown",function(e){if(e.key==="Escape")zoom.classList.remove("on")});
var imgs=[].slice.call(document.querySelectorAll(".article-content img")).filter(function(i){return !i.closest(".kb-lab,.kb-scrolly,a")});
var ioI=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("vz-on");ioI.unobserve(e.target)}})},{rootMargin:"0px 0px -10% 0px"});
imgs.forEach(function(i){i.classList.add("vz-img");ioI.observe(i);i.title="Clic para ampliar";
  i.addEventListener("click",function(){zoom.querySelector("img").src=i.currentSrc||i.src;zoom.querySelector("p").textContent=i.alt||"";zoom.classList.add("on")})});

/* ---------- 2) Índice lateral ---------- */
(function(){var links=[].slice.call(document.querySelectorAll('#indice a[href^="#"]')),items=[];
  links.forEach(function(a){var t=document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));if(t&&!a.closest("ul ul"))items.push([a,t])});
  items=items.filter(function(x){return !x[0].parentElement.closest("ul")});
  if(items.length<3||items.length>18)return;
  var rail=document.createElement("nav");rail.className="vz-rail";rail.setAttribute("aria-label","Secciones");
  items.forEach(function(x){var a=document.createElement("a");a.href=x[0].getAttribute("href");a.innerHTML="<span>"+x[0].textContent.trim()+"</span><i></i>";rail.appendChild(a);x.push(a)});
  document.body.appendChild(rail);
  function upd(){var cur=null;items.forEach(function(x){if(x[1].getBoundingClientRect().top<innerHeight*.4)cur=x});items.forEach(function(x){x[2].classList.toggle("on",x===cur)})}
  addEventListener("scroll",upd,{passive:true});upd()})();

/* ---------- 3) Laboratorios ---------- */
function lab(el,title,sub){el.innerHTML='<div class="kb-lab-head"><span class="kb-lab-badge">Pruébalo tú</span><b>'+title+'</b><small>'+sub+'</small></div>';
  var o={el:el};o.add=function(html){var d=document.createElement("div");d.innerHTML=html;while(d.firstChild)el.appendChild(d.firstChild)};return o}
function canvas(o){var c=document.createElement("canvas");c.className="kb-lab-canvas";o.el.appendChild(c);o.c=c;o.x=c.getContext("2d");
  o.fit=function(){var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),MIN=560,cw=r.width||MIN;if(!o.baseH)o.baseH=r.height||300;var sc=cw<MIN?cw/MIN:1;o.sc=sc;c.style.height=Math.round(o.baseH*sc)+"px";c.width=Math.round(cw*d);c.height=Math.round(o.baseH*sc*d);o.w=cw/sc;o.h=o.baseH;o.x.setTransform(d*sc,0,0,d*sc,0,0)};o.fit();
  addEventListener("resize",function(){o.fit();o.draw&&o.draw()});return o}
function controls(o,html){var d=document.createElement("div");d.className="kb-lab-controls";d.innerHTML=html;o.el.appendChild(d);var out=document.createElement("div");out.className="kb-lab-out";o.el.appendChild(out);o.out=out;return d}
function slider(id,lbl,min,max,step,val){return '<label class="kb-ctrl"><span class="kb-ctrl-lbl">'+lbl+'</span><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"><span class="kb-ctrl-val" id="'+id+'v"></span></label>'}
function seg(name,opts,act){return '<span class="kb-seg">'+opts.map(function(o){return '<button type="button" class="kb-btn'+(o===act?' activo':'')+'" data-'+name+'="'+o+'">'+o+'</button>'}).join("")+'</span>'}
function onSeg(root,name,cb){[].forEach.call(root.querySelectorAll("[data-"+name+"]"),function(b){b.addEventListener("click",function(){[].forEach.call(root.querySelectorAll("[data-"+name+"]"),function(x){x.classList.remove("activo")});b.classList.add("activo");cb(b.getAttribute("data-"+name))})})}
function axis(x,L,T,W,H){x.strokeStyle=GRID;x.lineWidth=1;for(var i=0;i<=4;i++){var y=T+H*i/4;x.beginPath();x.moveTo(L,y);x.lineTo(L+W,y);x.stroke()}x.strokeStyle="#c9cfdb";x.beginPath();x.moveTo(L,T+H);x.lineTo(L+W,T+H);x.stroke()}
function txt(x,s,X,Y,c,f,al){x.fillStyle=c||INK;x.font=(f||"12px")+" system-ui,sans-serif";x.textAlign=al||"left";x.textBaseline="middle";x.fillText(s,X,Y)}
function anim(o){var t0=null;o.go=function(){o.k=0;t0=null;requestAnimationFrame(function st(ts){if(t0===null)t0=ts;o.k=clamp((ts-t0)/500,0,1);o.draw();if(o.k<1)requestAnimationFrame(st)})}}

var V={};

/* Estadística: error estándar SE = σ/√n */
V["est-se"]=function(el){var o=canvas(lab(el,"Error estándar: SE = σ / √n","Mueve el tamaño de muestra: la campana de la media se hace más angosta, pero cada vez cuesta más datos mejorar."));
  var c=controls(o,slider("se_s","Variabilidad σ",5,50,1,20)+slider("se_n","Tamaño de muestra n",10,2000,10,100)+'<button type="button" class="kb-btn kb-btn-pri" id="se_x4">× 4 datos</button>');
  var S=c.querySelector("#se_s"),Nn=c.querySelector("#se_n");
  o.draw=function(){var x=o.x,w=o.w,h=o.h,s=+S.value,n=+Nn.value,se=s/Math.sqrt(n),L=36,T=24,W=w-L-20,H=h-T-40,mu=100,lo=mu-60,hi=mu+60;x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var X=function(v){return L+(v-lo)/(hi-lo)*W},pk=pdf(mu,mu,Math.max(se,.8));
    var pp=pdf(mu,mu,s);x.beginPath();for(var v=lo;v<=hi;v+=.25){var y=T+H-pdf(v,mu,s)/pp*H*.4;v===lo?x.moveTo(X(v),y):x.lineTo(X(v),y)}x.strokeStyle="#9aa3b5";x.lineWidth=2;x.setLineDash([5,4]);x.stroke();x.setLineDash([]);
    var g=x.createLinearGradient(L,0,L+W,0);G.forEach(function(cc,i){g.addColorStop(i/3,cc)});
    x.beginPath();x.moveTo(X(lo),T+H);for(var v=lo;v<=hi;v+=.1){x.lineTo(X(v),T+H-pdf(v,mu,Math.max(se,.8))/pk*H*.95)}x.lineTo(X(hi),T+H);x.closePath();x.globalAlpha=.25;x.fillStyle=g;x.fill();x.globalAlpha=1;x.strokeStyle=g;x.lineWidth=2.5;x.stroke();
    x.fillStyle="rgba(193,60,255,.12)";x.fillRect(X(mu-1.96*se),T,X(mu+1.96*se)-X(mu-1.96*se),H);
    txt(x,"95% de las medias",X(mu),T+10,"#9B3FD9","11px","center");
    for(var v=lo;v<=hi;v+=20)txt(x,v,X(v),T+H+14,DIM,"11px","center");
    txt(x,"- - población (cada cliente)     ▬ promedio de la muestra",L+6,T+8,DIM,"11px");
    c.querySelector("#se_sv").textContent=s;c.querySelector("#se_nv").textContent=fmt(n);
    o.out.innerHTML='<div class="kb-metricas"><span>SE = <b>'+fmt(se,2)+'</b></span><span>Margen 95% ≈ <b>± '+fmt(1.96*se,2)+'</b></span><span>Para la mitad de error: <b>'+fmt(n*4)+'</b> datos</span></div><small>Con 4 veces más datos el error solo baja a la mitad: por eso pasar de 1,000 a 10,000 clientes mejora menos de lo que parece.</small>'};
  S.oninput=Nn.oninput=o.draw;c.querySelector("#se_x4").onclick=function(){Nn.value=+Nn.value*4>2000?10:+Nn.value*4;o.draw()};o.draw()};

/* Estadística: errores tipo I y II, potencia */
V["est-ab"]=function(el){var o=canvas(lab(el,"Error tipo I (α), tipo II (β) y potencia","Mueve el valor crítico y el tamaño del efecto: verás cómo bajar α sube β, y cómo un efecto más grande da más potencia."));
  var c=controls(o,slider("ab_c","Valor crítico",0.5,3,0.05,1.64)+slider("ab_d","Tamaño del efecto",0,4,0.1,2.5));var Cc=c.querySelector("#ab_c"),D=c.querySelector("#ab_d");
  o.draw=function(){var x=o.x,w=o.w,h=o.h,cv=+Cc.value,d=+D.value,L=30,T=26,W=w-L-20,H=h-T-40,lo=-4,hi=8,X=function(v){return L+(v-lo)/(hi-lo)*W},Y=function(p){return T+H-p/.42*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    function area(m,a,b,col){x.beginPath();x.moveTo(X(a),T+H);for(var v=a;v<=b;v+=.02)x.lineTo(X(v),Y(pdf(v,m,1)));x.lineTo(X(b),T+H);x.closePath();x.fillStyle=col;x.fill()}
    function curve(m,col){x.beginPath();for(var v=lo;v<=hi;v+=.02){var y=Y(pdf(v,m,1));v===lo?x.moveTo(X(v),y):x.lineTo(X(v),y)}x.strokeStyle=col;x.lineWidth=2.5;x.stroke()}
    area(d,cv,hi,"rgba(25,227,107,.28)");area(d,lo,cv,"rgba(242,170,20,.35)");area(0,cv,hi,"rgba(214,69,69,.45)");curve(0,"#1f2430");curve(d,"#9B3FD9");
    x.strokeStyle="#D64545";x.setLineDash([5,4]);x.beginPath();x.moveTo(X(cv),T);x.lineTo(X(cv),T+H);x.stroke();x.setLineDash([]);
    txt(x,"H₀ (no hay efecto)",X(0),T+8,INK,"12px","center");txt(x,"H₁ (sí hay efecto)",X(d),T+24,"#9B3FD9","12px","center");txt(x,"valor crítico",X(cv)+6,T+H-10,"#D64545","11px");
    var a=1-Phi(cv),b=Phi(cv-d);c.querySelector("#ab_cv").textContent=cv.toFixed(2);c.querySelector("#ab_dv").textContent=d.toFixed(1);
    o.out.innerHTML='<div class="kb-metricas"><span style="color:#b53333">α = <b>'+fmt(a*100,1)+'%</b> falsa alarma</span><span style="color:#a8641c">β = <b>'+fmt(b*100,1)+'%</b> efecto no detectado</span><span style="color:#0e7a4d">Potencia = <b>'+fmt((1-b)*100,1)+'%</b></span></div><small>Rojo: rechazar H₀ siendo cierta (tipo I). Naranja: no rechazarla siendo falsa (tipo II). Verde: detectar el efecto real.</small>'};
  Cc.oninput=D.oninput=o.draw;o.draw()};

/* Bases de datos: tipos de JOIN */
V["bd-join"]=function(el){var o=canvas(lab(el,"¿Qué devuelve cada JOIN?","Elige el tipo de JOIN: se ilumina la zona del diagrama y aparecen las filas que devolvería la consulta."));
  var c=controls(o,seg("j",["INNER","LEFT","RIGHT","FULL OUTER"],"INNER"));var tipo="INNER";anim(o);
  var cli=[[1,"Ana"],[2,"Luis"],[3,"Sofía"],[4,"Carlos"]],ped=[[101,1,"$820"],[102,3,"$1,240"],[103,1,"$460"],[104,7,"$990"]];
  function rows(){var r=[];var inP=function(id){return ped.filter(function(p){return p[1]===id})};
    if(tipo!=="RIGHT"){cli.forEach(function(k){var ps=inP(k[0]);if(ps.length)ps.forEach(function(p){r.push([k[1],p[0],p[2]])});else if(tipo!=="INNER")r.push([k[1],"NULL","NULL"])})}
    else{ped.forEach(function(p){var k=cli.filter(function(k){return k[0]===p[1]})[0];r.push([k?k[1]:"NULL",p[0],p[2]])})}
    if(tipo==="FULL OUTER")ped.forEach(function(p){if(!cli.some(function(k){return k[0]===p[1]}))r.push(["NULL",p[0],p[2]])});return r}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,k=o.k==null?1:o.k;x.clearRect(0,0,w,h);var cx=Math.min(w*.26,190),cy=h/2,R=Math.min(80,h*.3),dx=R*.62;
    var on={A:tipo==="LEFT"||tipo==="FULL OUTER",B:tipo==="RIGHT"||tipo==="FULL OUTER",AB:true};
    function circ(px){x.beginPath();x.arc(px,cy,R,0,7)}
    x.save();circ(cx-dx);x.fillStyle=on.A?"rgba(0,194,255,"+(.45*k)+")":"#f3f5f9";x.fill();x.restore();
    x.save();circ(cx+dx);x.fillStyle=on.B?"rgba(193,60,255,"+(.45*k)+")":"#f3f5f9";x.fill();x.restore();
    x.save();circ(cx-dx);x.clip();circ(cx+dx);x.fillStyle="rgba(25,227,107,"+(.25+.5*k)+")";x.fill();x.restore();
    x.lineWidth=2;x.strokeStyle="#00C2FF";circ(cx-dx);x.stroke();x.strokeStyle="#C13CFF";circ(cx+dx);x.stroke();
    txt(x,"clientes",cx-dx-R*.45,cy-R-12,INK,"bold 12px","center");txt(x,"pedidos",cx+dx+R*.45,cy-R-12,INK,"bold 12px","center");
    var r=rows(),tx=Math.min(w*.52,cx*2+50),tw=w-tx-16,cw=[.42,.28,.3];txt(x,"Resultado: "+r.length+" filas",tx,22,INK,"bold 13px");
    ["cliente","pedido","total"].forEach(function(hd,i){var off=cw.slice(0,i).reduce(function(a,b){return a+b},0);txt(x,hd,tx+8+off*tw,48,DIM,"11px")});
    r.forEach(function(row,j){var y=70+j*24;if(y>h-10)return;x.globalAlpha=clamp(k*r.length-j,0,1);x.fillStyle=j%2?"#f8f9fc":"#fff";x.fillRect(tx,y-11,tw,22);
      row.forEach(function(v,i){var off=cw.slice(0,i).reduce(function(a,b){return a+b},0);txt(x,v,tx+8+off*tw,y,v==="NULL"?"#D64545":INK,"12px")});x.globalAlpha=1});
    var exp={"INNER":"Solo los clientes que sí compraron (Carlos no aparece y el pedido 104 tampoco).","LEFT":"Todos los clientes; si no compraron, sus columnas de pedido quedan en NULL.","RIGHT":"Todos los pedidos; el 104 es de un cliente que ya no existe, por eso NULL.","FULL OUTER":"Todo de ambas tablas: útil para conciliar dos sistemas y encontrar huecos."};
    o.out.innerHTML="<small>"+exp[tipo]+"</small>"};
  onSeg(c,"j",function(v){tipo=v;o.go()});o.draw()};

/* Sistemas operativos: terminal Bash / PowerShell */
V["so-term"]=function(el){var o=lab(el,"La misma tarea en Bash y en PowerShell","Elige el sistema y una acción: la terminal escribe el comando y muestra lo que respondería.");
  var term=document.createElement("div");term.className="vz-term";el.appendChild(term);
  var A={"Dónde estoy":["pwd","Get-Location","/home/juan/proyecto"],"Listar archivos":["ls -la","dir","datos/  modelo.py  requirements.txt  ventas.csv"],"Ver archivo":["head -n 3 ventas.csv","Get-Content ventas.csv -Head 3","fecha,sucursal,ventas\n2025-01-01,Centro,1520\n2025-01-02,Centro,1610"],
    "Buscar texto":['grep "error" log.txt','Select-String "error" log.txt',"log.txt:14: error de conexión a la base"],"Entorno virtual":["python -m venv .venv && source .venv/bin/activate",".venv\\Scripts\\activate","(.venv) listo para instalar librerías"],"Docker":["docker run -p 8000:8000 modelo-api","docker run -p 8000:8000 modelo-api","✓ API del modelo escuchando en :8000"]};
  var so="Bash",ac="Dónde estoy",tm=null;
  var c=controls(o,seg("so",["Bash","PowerShell"],"Bash")+'<span class="kb-seg">'+Object.keys(A).map(function(k){return '<button type="button" class="kb-btn'+(k===ac?' activo':'')+'" data-ac="'+k+'">'+k+'</button>'}).join("")+'</span>');
  function run(){clearInterval(tm);var cmd=A[ac][so==="Bash"?0:1],out=A[ac][2],pr=so==="Bash"?"juan@datasquad:~$ ":"PS C:\\proyecto> ",i=0;
    tm=setInterval(function(){i++;term.innerHTML='<span class="p">'+pr+'</span>'+cmd.slice(0,i).replace(/</g,"&lt;")+(i<cmd.length?'<span class="cur"></span>':'\n<span class="o">'+out.replace(/</g,"&lt;")+'</span>\n<span class="p">'+pr+'</span><span class="cur"></span>');if(i>=cmd.length)clearInterval(tm)},38);
    o.out.innerHTML="<small>"+(so==="Bash"?"Bash es la terminal de Linux y macOS: la de los servidores donde corren los modelos.":"PowerShell es la terminal de Windows: muchos comandos de Linux también funcionan como alias.")+"</small>"}
  onSeg(c,"so",function(v){so=v;run()});onSeg(c,"ac",function(v){ac=v;run()});run()};

/* Storytelling: arcoíris vs. color de acento, con simulación de daltonismo */
V["st-color"]=function(el){var o=canvas(lab(el,"Un color de acento vs. arcoíris","Cambia el estilo y activa la simulación de daltonismo: con un solo color de acento el mensaje se entiende en segundos."));
  var c=controls(o,seg("st",["Arcoíris","Un acento"],"Arcoíris")+'<label class="kb-check"><input type="checkbox" id="st_dal"> Simular daltonismo (deuteranopía)</label>');var modo="Arcoíris";anim(o);
  var nm=["Centro","Sur","Bajío","Norte","Golfo","Pacífico","Sureste"],v=[42,55,38,74,47,33,50],rain=["#e53935","#fb8c00","#fdd835","#43a047","#00acc1","#3949ab","#8e24aa"];
  function hx(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
  function deut(rgb){var r=rgb[0],g=rgb[1],b=rgb[2];return[Math.round(.625*r+.375*g),Math.round(.7*r+.3*g),Math.round(.3*g+.7*b)]}
  function col(i){var h=modo==="Arcoíris"?rain[i]:(i===3?"#1e88e5":"#c4c9d4"),rgb=hx(h);if(document.getElementById("st_dal").checked)rgb=deut(rgb);return"rgb("+rgb.join(",")+")"}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,k=o.k==null?1:o.k,L=30,T=40,W=w-L-20,H=h-T-40,bw=W/nm.length;x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    txt(x,modo==="Un acento"?"Norte creció 45% y ya lidera las ventas":"Ventas por región 2025",L,16,INK,"bold 14px");
    nm.forEach(function(n,i){var hh=v[i]/80*H*(.3+.7*k),xx=L+i*bw+bw*.18;x.fillStyle=col(i);x.beginPath();x.roundRect?x.roundRect(xx,T+H-hh,bw*.64,hh,4):x.rect(xx,T+H-hh,bw*.64,hh);x.fill();
      txt(x,n,xx+bw*.32,T+H+14,i===3&&modo==="Un acento"?INK:DIM,"11px","center");if(modo==="Arcoíris"||i===3)txt(x,v[i],xx+bw*.32,T+H-hh-10,DIM,"11px","center")});
    o.out.innerHTML="<small>"+(modo==="Arcoíris"?"Todos los colores compiten: el ojo no sabe a dónde mirar"+(document.getElementById("st_dal").checked?" y, con daltonismo, rojo, naranja y verde casi se confunden.":"."):"Gris para el contexto y un solo color para lo importante: se entiende igual con o sin daltonismo.")+"</small>"};
  onSeg(c,"st",function(m){modo=m;o.go()});c.querySelector("#st_dal").onchange=function(){o.draw()};o.draw()};

/* Azure: quién administra cada capa (IaaS, PaaS, SaaS) */
V["az-resp"]=function(el){var o=lab(el,"¿Quién administra cada capa?","Elige el modelo de servicio: las capas oscuras las administras tú y las de color las administra el proveedor de nube.");
  var capas=["Datos","Aplicaciones","Runtime","Middleware","Sistema operativo","Virtualización","Servidores","Almacenamiento","Red"],nube={"On-premise":0,"IaaS":4,"PaaS":7,"SaaS":9};
  el.insertAdjacentHTML("beforeend",'<div class="vz-leyenda"><span><i style="background:#1f2430"></i>Tú administras</span><span><i style="background:linear-gradient(90deg,#d8f3ff,#efe1ff)"></i>Lo administra la nube</span></div>');
  var st=document.createElement("div");st.className="vz-stack";el.appendChild(st);
  capas.forEach(function(cp){st.insertAdjacentHTML("beforeend","<div><span>"+cp+"</span><small></small></div>")});
  var c=controls(o,seg("az",["On-premise","IaaS","PaaS","SaaS"],"IaaS"));
  var ej={"On-premise":"Tu propio centro de datos: compras servidores y administras todo.","IaaS":"Rentas máquinas virtuales: la nube pone el hardware y la red; tú instalas el sistema operativo, librerías y tu modelo.","PaaS":"Solo subes tu código o tu modelo: la nube administra servidores, sistema operativo y escalamiento (por ejemplo, una app web o un servicio de ML administrado).","SaaS":"Usas el software terminado desde el navegador; solo administras tus datos y usuarios (correo, Office en la nube, Power BI)."};
  function set(m){var n=nube[m];[].forEach.call(st.children,function(d,i){var mine=i<capas.length-n||(m==="SaaS"&&i===0);d.className=mine?"tu":"nube";d.querySelector("small").textContent=mine?"tú":"proveedor"});o.out.innerHTML="<small><b>"+m+":</b> "+ej[m]+"</small>"}
  onSeg(c,"az",set);set("IaaS")};

/* Ingeniería de variables: media móvil y rezago */
V["iv-roll"]=function(el){var o=canvas(lab(el,"Media móvil y rezago (lag) en una serie de ventas","Mueve la ventana y el rezago: la media móvil suaviza el ruido y el lag copia la serie hacia adelante."));
  var c=controls(o,slider("iv_w","Ventana de la media móvil (días)",2,30,1,7)+slider("iv_l","Rezago / lag (días)",0,14,1,7)+'<label class="kb-check"><input type="checkbox" id="iv_s" checked> Usar solo días anteriores (shift)</label>');
  var N=90,Y=[],s=7;for(var i=0;i<N;i++){s=(s*9301+49297)%233280;Y.push(50+12*Math.sin(2*Math.PI*i/7)+.18*i+(s/233280-.5)*14+(i===70?30:0))}
  var Wn=c.querySelector("#iv_w"),Lg=c.querySelector("#iv_l"),Sh=c.querySelector("#iv_s");
  o.draw=function(){var x=o.x,w=o.w,h=o.h,win=+Wn.value,lag=+Lg.value,sh=Sh.checked,L=30,T=30,W=w-L-16,H=h-T-34,lo=20,hi=105,X=function(i){return L+i/(N-1)*W},Yp=function(v){return T+H-(v-lo)/(hi-lo)*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    function line(get,col,lw,dash){x.beginPath();var st=false;for(var i=0;i<N;i++){var v=get(i);if(v==null)continue;st?x.lineTo(X(i),Yp(v)):(x.moveTo(X(i),Yp(v)),st=true)}x.strokeStyle=col;x.lineWidth=lw;x.setLineDash(dash||[]);x.stroke();x.setLineDash([])}
    var ma=function(i){var e=sh?i-1:i,b=e-win+1;if(b<0)return null;var t=0;for(var k=b;k<=e;k++)t+=Y[k];return t/win};
    line(function(i){return Y[i]},"rgba(0,150,220,.55)",1.4);if(lag>0)line(function(i){return i-lag>=0?Y[i-lag]:null},"#C13CFF",1.5,[5,4]);line(ma,"#13A86A",3);
    var j=N-1,wx0=X((sh?j-1:j)-win+1),wx1=X(sh?j-1:j);x.fillStyle="rgba(242,232,20,.18)";x.fillRect(wx0,T,wx1-wx0,H);
    [["ventas",G[0]],["media móvil",G[2]],["lag "+lag,G[1]]].forEach(function(l,i){x.fillStyle=l[1];x.fillRect(L+i*110,12,14,3);txt(x,l[0],L+i*110+20,14,DIM,"11px")});
    c.querySelector("#iv_wv").textContent=win;c.querySelector("#iv_lv").textContent=lag;
    o.out.innerHTML='<div class="kb-metricas"><span>Hoy: <b>'+fmt(Y[j],1)+'</b></span><span>media_'+win+' = <b>'+fmt(ma(j),1)+'</b></span><span>lag_'+lag+' = <b>'+(lag?fmt(Y[j-lag],1):"—")+'</b></span></div><small>'+(sh?"Correcto: la media solo usa días anteriores, como pasaría al pronosticar de verdad.":"<span class=\"kb-alerta\">Fuga de información:</span> la media incluye el día que quieres predecir; el modelo se verá mejor de lo que es.")+"</small>"};
  Wn.oninput=Lg.oninput=Sh.onchange=o.draw;o.draw()};


/* ================= Laboratorios adicionales ================= */
function rnd(seed){return function(){seed=(seed*9301+49297)%233280;return seed/233280}}
function gauss(r){var u=r()||1e-9,v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function grad(x,a,b){var g=x.createLinearGradient(a,0,b,0);G.forEach(function(c,i){g.addColorStop(i/3,c)});return g}
function rr(x,X,Y,W,H,r){x.beginPath();if(x.roundRect)x.roundRect(X,Y,W,H,r);else x.rect(X,Y,W,H)}
function val(c,id,t){var e=c.querySelector("#"+id+"v");if(e)e.textContent=t}
function sliders(o,c,ids){ids.forEach(function(id){c.querySelector("#"+id).addEventListener("input",function(){o.draw&&o.draw()})})}

/* ---- ESTADÍSTICA ---- */
V["est-prop"]=function(el){var o=canvas(lab(el,"Proporción muestral e intervalo de confianza","Mueve la proporción real y el tamaño de muestra: con más clientes encuestados el intervalo se cierra."));
  var c=controls(o,slider("pp_p","Proporción real p",0.05,0.95,0.01,0.3)+slider("pp_n","Clientes encuestados n",20,2000,10,200));sliders(o,c,["pp_p","pp_n"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,p=+c.querySelector("#pp_p").value,n=+c.querySelector("#pp_n").value,se=Math.sqrt(p*(1-p)/n),L=30,T=24,W=w-L-20,H=h-T-38,X=function(v){return L+v*W};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var pk=pdf(p,p,se);x.fillStyle="rgba(193,60,255,.12)";x.fillRect(X(p-1.96*se),T,X(p+1.96*se)-X(p-1.96*se),H);
    x.beginPath();x.moveTo(X(0),T+H);for(var v=0;v<=1;v+=.002)x.lineTo(X(v),T+H-pdf(v,p,se)/pk*H*.92);x.lineTo(X(1),T+H);x.closePath();x.globalAlpha=.3;x.fillStyle=grad(x,L,L+W);x.fill();x.globalAlpha=1;x.strokeStyle=grad(x,L,L+W);x.lineWidth=2.5;x.stroke();
    for(var v=0;v<=1.001;v+=.1)txt(x,Math.round(v*100)+"%",X(v),T+H+14,DIM,"11px","center");txt(x,"intervalo 95%",X(p),T+10,"#9B3FD9","11px","center");
    val(c,"pp_p",Math.round(p*100)+"%");val(c,"pp_n",fmt(n));
    o.out.innerHTML='<div class="kb-metricas"><span>p̂ = <b>'+fmt(p*100,0)+'%</b></span><span>Error estándar = <b>'+fmt(se*100,2)+'%</b></span><span>IC 95%: <b>'+fmt(Math.max(0,p-1.96*se)*100,1)+'% – '+fmt(Math.min(1,p+1.96*se)*100,1)+'%</b></span></div><small>Ejemplo: si 30% de los clientes usa la app, con 200 encuestas el dato real estaría entre esos dos valores 95 de cada 100 veces.</small>'};o.draw()};

V["est-n"]=function(el){var o=canvas(lab(el,"¿Cuántos datos necesito?","Elige el margen de error y la confianza: la curva muestra cómo se disparan los datos cuando pides más precisión."));
  var c=controls(o,slider("sn_e","Margen de error E",1,10,0.5,5)+slider("sn_p","Proporción esperada p",5,50,1,50)+seg("cf",["90%","95%","99%"],"95%"));var z={"90%":1.645,"95%":1.96,"99%":2.576},cf="95%";
  sliders(o,c,["sn_e","sn_p"]);onSeg(c,"cf",function(v){cf=v;o.draw()});
  o.draw=function(){var x=o.x,w=o.w,h=o.h,E=+c.querySelector("#sn_e").value/100,p=+c.querySelector("#sn_p").value/100,Z=z[cf],N=function(e){return Z*Z*p*(1-p)/(e*e)},L=56,T=20,W=w-L-20,H=h-T-38,mx=N(.01);x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var X=function(e){return L+(e-.01)/(.09)*W},Y=function(n){return T+H-Math.sqrt(n/mx)*H};
    x.beginPath();for(var e=.01;e<=.1;e+=.001){e===.01?x.moveTo(X(e),Y(N(e))):x.lineTo(X(e),Y(N(e)))}x.strokeStyle=grad(x,L,L+W);x.lineWidth=3;x.stroke();
    var n=Math.ceil(N(E));x.setLineDash([4,4]);x.strokeStyle="#9aa3b5";x.beginPath();x.moveTo(X(E),T+H);x.lineTo(X(E),Y(n));x.lineTo(L,Y(n));x.stroke();x.setLineDash([]);
    x.fillStyle="#C13CFF";x.beginPath();x.arc(X(E),Y(n),6,0,7);x.fill();txt(x,fmt(n)+" datos",X(E)+10,Y(n)-12,INK,"bold 13px");
    for(var e=1;e<=10;e++)txt(x,e+"%",X(e/100),T+H+14,DIM,"11px","center");val(c,"sn_e",fmt(E*100,1)+"%");val(c,"sn_p",Math.round(p*100)+"%");
    o.out.innerHTML='<div class="kb-metricas"><span>n = z² · p(1−p) / E² = <b>'+fmt(n)+'</b></span><span>Para la mitad de margen: <b>'+fmt(Math.ceil(N(E/2)))+'</b></span></div><small>p = 50% es el caso más conservador: si no sabes nada del dato, usa ese valor.</small>'};o.draw()};

V["est-reg"]=function(el){var o=canvas(lab(el,"Regresión lineal: haz clic para agregar puntos","Cada punto es una semana (inversión en publicidad vs ventas). Agrega puntos o un atípico y mira cómo cambian la recta y el R²."));
  var c=controls(o,'<button type="button" class="kb-btn" id="rg_out">Agregar atípico</button><button type="button" class="kb-btn" id="rg_rst">Reiniciar</button><label class="kb-check"><input type="checkbox" id="rg_res" checked> Mostrar residuales</label>');
  var r=rnd(3),P;function reset(){P=[];for(var i=0;i<14;i++){var xx=1+r()*9;P.push([xx,20+6*xx+gauss(r)*5])}}reset();
  var L=40,T=20;function geo(){return{W:o.w-L-20,H:o.h-T-36}}
  o.c.style.cursor="crosshair";o.c.addEventListener("click",function(e){var b=o.c.getBoundingClientRect(),g=geo(),xx=((e.clientX-b.left)/(o.sc||1)-L)/g.W*11,yy=(T+g.H-((e.clientY-b.top)/(o.sc||1)))/g.H*100;if(xx>=0&&xx<=11&&yy>=0&&yy<=100){P.push([xx,yy]);o.draw()}});
  c.querySelector("#rg_out").onclick=function(){P.push([9.5,25]);o.draw()};c.querySelector("#rg_rst").onclick=function(){reset();o.draw()};c.querySelector("#rg_res").onchange=function(){o.draw()};
  o.draw=function(){var x=o.x,w=o.w,h=o.h,g=geo(),X=function(v){return L+v/11*g.W},Y=function(v){return T+g.H-v/100*g.H};x.clearRect(0,0,w,h);axis(x,L,T,g.W,g.H);
    var n=P.length,mx=0,my=0;P.forEach(function(p){mx+=p[0];my+=p[1]});mx/=n;my/=n;var sxy=0,sxx=0,st=0,sr=0;P.forEach(function(p){sxy+=(p[0]-mx)*(p[1]-my);sxx+=(p[0]-mx)*(p[0]-mx)});var b1=sxy/sxx,b0=my-b1*mx;
    P.forEach(function(p){var f=b0+b1*p[0];st+=(p[1]-my)*(p[1]-my);sr+=(p[1]-f)*(p[1]-f);if(c.querySelector("#rg_res").checked){x.strokeStyle="rgba(214,69,69,.45)";x.beginPath();x.moveTo(X(p[0]),Y(p[1]));x.lineTo(X(p[0]),Y(f));x.stroke()}});
    x.strokeStyle=grad(x,L,L+g.W);x.lineWidth=3;x.beginPath();x.moveTo(X(0),Y(b0));x.lineTo(X(11),Y(b0+b1*11));x.stroke();
    P.forEach(function(p){x.fillStyle="#1f2430";x.beginPath();x.arc(X(p[0]),Y(p[1]),4.5,0,7);x.fill()});
    txt(x,"publicidad (miles $)",L+g.W,T+g.H+16,DIM,"11px","right");txt(x,"ventas",L-34,T+6,DIM,"11px");
    o.out.innerHTML='<div class="kb-metricas"><span>ventas = <b>'+fmt(b0,1)+' + '+fmt(b1,2)+' · publicidad</b></span><span>R² = <b>'+fmt(1-sr/st,2)+'</b></span><span>Puntos: <b>'+n+'</b></span></div><small>La pendiente dice cuánto suben las ventas por cada mil pesos extra de publicidad. Un solo atípico puede mover mucho la recta.</small>'};o.draw()};

V["est-ridge"]=function(el){var o=canvas(lab(el,"Regularización L1 (Lasso) y L2 (Ridge)","Sube λ: Ridge encoge todos los coeficientes; Lasso lleva a cero los menos útiles y así selecciona variables."));
  var c=controls(o,slider("rd_l","Fuerza de regularización λ",0,10,0.1,2)+seg("rg",["L2 · Ridge","L1 · Lasso"],"L2 · Ridge"));var tipo="L2 · Ridge";sliders(o,c,["rd_l"]);onSeg(c,"rg",function(v){tipo=v;o.draw()});
  var nm=["precio","promoción","temporada","clima","día de la semana","ruido"],b=[3,-2.2,1.5,.6,-.35,.15];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,l=+c.querySelector("#rd_l").value,L=Math.min(150,w*.3),T=18,W=w-L-30,rowH=(h-T-20)/b.length,cx=L+W/2,z=0;x.clearRect(0,0,w,h);
    x.strokeStyle="#c9cfdb";x.beginPath();x.moveTo(cx,T);x.lineTo(cx,h-14);x.stroke();
    b.forEach(function(v,i){var nv=tipo[1]==="2"?v/(1+l*.35):Math.sign(v)*Math.max(0,Math.abs(v)-l*.3);if(nv===0)z++;var y=T+i*rowH+rowH*.2,bw=nv/3.2*(W/2);
      x.fillStyle="#eef1f6";rr(x,cx+Math.min(0,v/3.2*W/2),y,Math.abs(v/3.2*W/2),rowH*.6,4);x.fill();
      x.fillStyle=nv===0?"#c9cfdb":(nv>0?"#00A6E0":"#C13CFF");rr(x,cx+Math.min(0,bw),y,Math.abs(bw)||2,rowH*.6,4);x.fill();
      txt(x,nm[i],L-10,y+rowH*.3,nv===0?"#9aa3b5":INK,"12px","right");txt(x,fmt(nv,2),cx+bw+(bw>=0?8:-8),y+rowH*.3,DIM,"11px",bw>=0?"left":"right")});
    val(c,"rd_l",fmt(l,1));o.out.innerHTML='<div class="kb-metricas"><span>Variables eliminadas: <b>'+z+' de '+b.length+'</b></span></div><small>Gris claro: valor original sin regularizar. '+(tipo[1]==="2"?"Ridge nunca llega a cero: reduce el sobreajuste sin quitar variables.":"Lasso apaga primero las variables que menos aportan (ruido, día): hace selección de variables.")+'</small>'};o.draw()};

V["est-pca"]=function(el){var o=canvas(lab(el,"PCA: encontrar la dirección con más información","Sube la correlación entre las dos variables: el primer componente captura cada vez más varianza y se puede quedar solo con él."));
  var c=controls(o,slider("pc_r","Correlación entre variables",0,0.97,0.01,0.8));sliders(o,c,["pc_r"]);var r=rnd(11),Z=[];for(var i=0;i<220;i++)Z.push([gauss(r),gauss(r)]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,rho=+c.querySelector("#pc_r").value,cx=w/2,cy=h/2,s=Math.min(w,h)*.17;x.clearRect(0,0,w,h);
    x.strokeStyle="#eef1f6";x.beginPath();x.moveTo(cx-s*3,cy);x.lineTo(cx+s*3,cy);x.moveTo(cx,cy-s*2.6);x.lineTo(cx,cy+s*2.6);x.stroke();
    var P=Z.map(function(z){return[z[0],rho*z[0]+Math.sqrt(1-rho*rho)*z[1]]});P.forEach(function(p){x.fillStyle="rgba(31,36,48,.45)";x.beginPath();x.arc(cx+p[0]*s,cy-p[1]*s,2.6,0,7);x.fill()});
    var l1=1+rho,l2=1-rho,ang=Math.PI/4;function arrow(a,len,col,lb){var ex=cx+Math.cos(a)*len,ey=cy-Math.sin(a)*len;x.strokeStyle=col;x.lineWidth=4;x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.stroke();x.fillStyle=col;x.beginPath();x.arc(ex,ey,5,0,7);x.fill();txt(x,lb,ex+8,ey-10,col,"bold 12px")}
    arrow(ang,Math.sqrt(l1)*s*1.8,"#C13CFF","PC1");arrow(ang+Math.PI/2,Math.max(Math.sqrt(l2)*s*1.8,6),"#00A6E0","PC2");
    txt(x,"ventas",cx+s*3,cy+14,DIM,"11px","right");txt(x,"tráfico",cx+6,cy-s*2.5,DIM,"11px");val(c,"pc_r",fmt(rho,2));
    o.out.innerHTML='<div class="kb-metricas"><span>PC1 explica <b>'+fmt(l1/2*100,1)+'%</b></span><span>PC2 explica <b>'+fmt(l2/2*100,1)+'%</b></span></div><small>Cuando las variables se mueven juntas, una sola dirección (PC1) resume casi toda la información: así se reducen dimensiones.</small>'};o.draw()};

V["est-colas"]=function(el){var o=canvas(lab(el,"Teoría de colas: ¿cuántas cajas abrir?","Cambia la llegada de clientes, la velocidad de atención y el número de cajas: si la utilización se acerca a 100%, la fila explota."));
  var c=controls(o,slider("cq_l","Clientes que llegan por hora λ",10,150,1,70)+slider("cq_m","Clientes que atiende una caja por hora μ",10,60,1,30)+slider("cq_c","Cajas abiertas c",1,8,1,3));sliders(o,c,["cq_l","cq_m","cq_c"]);
  function erlangC(lm,mu,k){var a=lm/mu,rho=a/k;if(rho>=1)return null;var sum=0,term=1;for(var i=0;i<k;i++){if(i>0)term*=a/i;sum+=term}var top=term*a/k/(1-rho);return top/(sum+top)}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,lm=+c.querySelector("#cq_l").value,mu=+c.querySelector("#cq_m").value,k=+c.querySelector("#cq_c").value,rho=lm/(k*mu),pc=erlangC(lm,mu,k),Wq=pc==null?Infinity:pc/(k*mu-lm)*60,Lq=pc==null?40:pc*rho/(1-rho);x.clearRect(0,0,w,h);
    var bx=w*.62;for(var i=0;i<k;i++){var y=30+i*Math.min(32,(h-60)/k);x.fillStyle=rho>=1?"#D64545":"#13A86A";rr(x,bx,y,46,22,6);x.fill();txt(x,"caja "+(i+1),bx+23,y+11,"#fff","bold 11px","center")}
    var q=Math.min(60,Math.round(Lq)),per=Math.max(1,Math.floor((bx-60)/20));for(var j=0;j<q;j++){var col=j%per,row=Math.floor(j/per);x.fillStyle=G[j%4];x.beginPath();x.arc(bx-26-col*20,46+row*22,7,0,7);x.fill()}if(q===0)txt(x,"sin fila: llegan y los atienden",bx-30,52,"#0e7a4d","12px","right");
    txt(x,"fila de espera: "+(pc==null?"crece sin fin":fmt(Lq,1)+" personas"),20,h-18,pc==null?"#D64545":INK,"bold 13px");
    val(c,"cq_l",lm);val(c,"cq_m",mu);val(c,"cq_c",k);
    o.out.innerHTML='<div class="kb-metricas"><span>Utilización ρ = <b'+(rho>.85?' class="kb-alerta"':'')+'>'+fmt(Math.min(rho,9.99)*100,0)+'%</b></span><span>Espera promedio: <b>'+(pc==null?"∞":fmt(Wq,1)+" min")+'</b></span></div><small>Modelo M/M/c (Erlang C). Pasar de 90% a 95% de utilización puede duplicar la espera: por eso no conviene operar al límite.</small>'};o.draw()};

V["est-ev"]=function(el){var o=canvas(lab(el,"Pérdida esperada: PD × LGD × EAD","Mueve la probabilidad de impago, la severidad y el monto: así calcula un banco cuánto reservar por riesgo de crédito."));
  var c=controls(o,slider("ev_pd","Probabilidad de impago PD",0.5,30,0.5,5)+slider("ev_lgd","Pérdida si no paga LGD",10,90,1,45)+slider("ev_ead","Monto expuesto EAD (miles $)",10,500,10,100)+slider("ev_n","Número de clientes",100,10000,100,2000));sliders(o,c,["ev_pd","ev_lgd","ev_ead","ev_n"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,pd=+c.querySelector("#ev_pd").value/100,lgd=+c.querySelector("#ev_lgd").value/100,ead=+c.querySelector("#ev_ead").value,n=+c.querySelector("#ev_n").value,el1=pd*lgd*ead;x.clearRect(0,0,w,h);
    var steps=[["Monto prestado (EAD)",ead,"#1f2430"],["× LGD: lo que se perdería",ead*lgd,"#C13CFF"],["× PD: pérdida esperada",el1,"#D64545"]],L=Math.min(210,w*.38),W=w-L-90,bh=(h-40)/3;
    steps.forEach(function(s,i){var y=20+i*bh,bw=Math.max(3,s[1]/ead*W);x.fillStyle="#eef1f6";rr(x,L,y,W,bh*.55,6);x.fill();x.fillStyle=s[2];rr(x,L,y,bw,bh*.55,6);x.fill();txt(x,s[0],L-10,y+bh*.27,INK,"12px","right");txt(x,"$"+fmt(s[1]*1000),L+bw+8,y+bh*.27,DIM,"12px")});
    val(c,"ev_pd",fmt(pd*100,1)+"%");val(c,"ev_lgd",Math.round(lgd*100)+"%");val(c,"ev_ead","$"+fmt(ead)+"k");val(c,"ev_n",fmt(n));
    o.out.innerHTML='<div class="kb-metricas"><span>Por cliente: <b>$'+fmt(el1*1000)+'</b></span><span>Cartera de '+fmt(n)+' clientes: <b>$'+fmt(el1*1000*n)+'</b></span></div><small>Esta es la esperanza matemática de la pérdida: no es lo que pasará con cada cliente, sino el promedio sobre muchos.</small>'};o.draw()};

V["est-mc"]=function(el){var o=canvas(lab(el,"Monte Carlo: ¿cuánto inventario necesito?","Simula muchos días de demanda y mueve el inventario: la zona roja son los días en que no alcanzaría."));
  var c=controls(o,slider("mc_s","Inventario disponible (piezas)",60,200,1,140)+'<button type="button" class="kb-btn kb-btn-pri" id="mc_go">Simular 1,000 días</button><button type="button" class="kb-btn" id="mc_rst">Reiniciar</button>');
  var r=rnd(17),D=[];function sim(k){for(var i=0;i<k;i++)D.push(Math.max(0,120+gauss(r)*25))}sim(200);
  c.querySelector("#mc_go").onclick=function(){sim(1000);o.draw()};c.querySelector("#mc_rst").onclick=function(){D=[];sim(200);o.draw()};sliders(o,c,["mc_s"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,S=+c.querySelector("#mc_s").value,L=30,T=20,W=w-L-20,H=h-T-38,lo=30,hi=210,B=36,bw=(hi-lo)/B,cnt=new Array(B).fill(0),fal=0;D.forEach(function(d){var b=Math.floor((d-lo)/bw);if(b>=0&&b<B)cnt[b]++;if(d>S)fal++});
    var mx=Math.max.apply(null,cnt)||1,X=function(v){return L+(v-lo)/(hi-lo)*W};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    cnt.forEach(function(k,i){var v=lo+i*bw,bh=k/mx*H;x.fillStyle=v+bw>S?"rgba(214,69,69,.75)":"rgba(0,166,224,.7)";rr(x,X(v)+1,T+H-bh,W/B-2,bh,2);x.fill()});
    x.strokeStyle="#1f2430";x.lineWidth=2;x.setLineDash([5,4]);x.beginPath();x.moveTo(X(S),T);x.lineTo(X(S),T+H);x.stroke();x.setLineDash([]);txt(x,"inventario = "+S,X(S)+6,T+10,INK,"bold 12px");
    for(var v=40;v<=200;v+=40)txt(x,v,X(v),T+H+14,DIM,"11px","center");val(c,"mc_s",S);
    o.out.innerHTML='<div class="kb-metricas"><span>Días simulados: <b>'+fmt(D.length)+'</b></span><span>Días con faltante: <b class="'+(fal/D.length>.1?"kb-alerta":"kb-ok")+'">'+fmt(fal/D.length*100,1)+'%</b></span><span>Nivel de servicio: <b>'+fmt((1-fal/D.length)*100,1)+'%</b></span></div><small>Demanda simulada: promedio 120 piezas, variación ±25. Entre más días simulas, más estable es la estimación.</small>'};o.draw()};

V["est-markov"]=function(el){var o=canvas(lab(el,"Cadena de Markov: ¿cómo evoluciona una cartera de crédito?","Avanza los meses: cada mes los clientes cambian de estado según la matriz de transición y la cartera se va al equilibrio."));
  var c=controls(o,slider("mk_t","Meses transcurridos",0,24,1,0)+'<button type="button" class="kb-btn kb-btn-pri" id="mk_play">▶ Reproducir</button>');
  var M=[[.90,.08,.02],[.40,.45,.15],[0,0,1]],nm=["Al corriente","Con atraso","Default"],col=["#13A86A","#F2A814","#D64545"],tm=null;
  c.querySelector("#mk_t").oninput=function(){o.draw()};c.querySelector("#mk_play").onclick=function(){clearInterval(tm);var s=c.querySelector("#mk_t");s.value=0;tm=setInterval(function(){s.value=+s.value+1;o.draw();if(+s.value>=24)clearInterval(tm)},220)};
  o.draw=function(){var x=o.x,w=o.w,h=o.h,t=+c.querySelector("#mk_t").value,v=[1,0,0];for(var k=0;k<t;k++){v=[0,1,2].map(function(j){return v[0]*M[0][j]+v[1]*M[1][j]+v[2]*M[2][j]})}x.clearRect(0,0,w,h);
    var L=40,W=w*.5-L,bh=(h-50)/3;v.forEach(function(p,i){var y=25+i*bh;x.fillStyle="#eef1f6";rr(x,L+90,y,W,bh*.55,6);x.fill();x.fillStyle=col[i];rr(x,L+90,y,Math.max(2,p*W),bh*.55,6);x.fill();txt(x,nm[i],L+80,y+bh*.27,INK,"12px","right");txt(x,fmt(p*100,1)+"%",L+96+p*W,y+bh*.27,DIM,"12px")});
    var mx=w*.62,my=40,cs=Math.min(46,(w-mx-20)/3);txt(x,"Matriz de transición (de → a)",mx,my-16,INK,"bold 12px");M.forEach(function(row,i){row.forEach(function(p,j){x.fillStyle="rgba(193,60,255,"+(.08+p*.6)+")";rr(x,mx+j*cs,my+i*cs,cs-4,cs-4,6);x.fill();txt(x,fmt(p*100,0)+"%",mx+j*cs+cs/2-2,my+i*cs+cs/2-2,p>.5?"#fff":INK,"11px","center")})});
    val(c,"mk_t",t);o.out.innerHTML='<small>Mes '+t+': de cada 100 clientes, '+fmt(v[2]*100,0)+' ya cayeron en default. Ese estado es "absorbente": quien entra no sale.</small>'};o.draw()};

V["est-lln"]=function(el){var o=canvas(lab(el,"Ley de los grandes números: el promedio se estabiliza","Aumenta el número de tickets: el promedio estimado se acerca al valor real y el embudo de error se cierra."));
  var c=controls(o,slider("ln_n","Tickets observados",10,5000,10,300));sliders(o,c,["ln_n"]);var r=rnd(23),T0=[];for(var i=0;i<5000;i++)T0.push(Math.max(20,350+gauss(r)*120));
  o.draw=function(){var x=o.x,w=o.w,h=o.h,n=+c.querySelector("#ln_n").value,L=44,T=18,W=w-L-20,H=h-T-38,X=function(i){return L+Math.log(i)/Math.log(5000)*W},Y=function(v){return T+H/2-(v-350)/180*H/2};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    x.beginPath();for(var i=2;i<=5000;i*=1.05){x.lineTo(X(i),Y(350+1.96*120/Math.sqrt(i)))}for(var i=5000;i>=2;i/=1.05){x.lineTo(X(i),Y(350-1.96*120/Math.sqrt(i)))}x.closePath();x.fillStyle="rgba(193,60,255,.10)";x.fill();
    x.strokeStyle="#1f2430";x.setLineDash([5,4]);x.beginPath();x.moveTo(L,Y(350));x.lineTo(L+W,Y(350));x.stroke();x.setLineDash([]);
    var s=0,m=0;x.beginPath();for(var i=1;i<=n;i++){s+=T0[i-1];m=s/i;var px=X(i),py=Y(clamp(m,170,530));i===1?x.moveTo(px,py):x.lineTo(px,py)}x.strokeStyle=grad(x,L,L+W);x.lineWidth=2.5;x.stroke();
    [10,100,1000,5000].forEach(function(v){txt(x,fmt(v),X(v),T+H+14,DIM,"11px","center")});txt(x,"ticket real $350",L+W,Y(350)-10,INK,"11px","right");val(c,"ln_n",fmt(n));
    o.out.innerHTML='<div class="kb-metricas"><span>Promedio estimado: <b>$'+fmt(m,2)+'</b></span><span>Error estándar: <b>±$'+fmt(120/Math.sqrt(n),2)+'</b></span></div><small>Eje horizontal en escala logarítmica: los primeros datos mueven mucho el promedio; después, cada dato nuevo cambia muy poco.</small>'};o.draw()};

/* ---- MATEMÁTICAS ---- */
V["mat-matriz"]=function(el){var o=canvas(lab(el,"Una matriz transforma el espacio","Mueve rotación, escala y cizalla: la cuadrícula se deforma y el determinante dice cuánto cambia el área."));
  var c=controls(o,slider("mz_r","Rotación (°)",-180,180,1,20)+slider("mz_sx","Escala en x",0.2,2,0.05,1.2)+slider("mz_sy","Escala en y",0.2,2,0.05,0.8)+slider("mz_k","Cizalla",-1,1,0.05,0.3));sliders(o,c,["mz_r","mz_sx","mz_sy","mz_k"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,t=+c.querySelector("#mz_r").value*Math.PI/180,sx=+c.querySelector("#mz_sx").value,sy=+c.querySelector("#mz_sy").value,k=+c.querySelector("#mz_k").value;
    var a=Math.cos(t)*sx,b=-Math.sin(t)*sy+Math.cos(t)*k*sy,cc=Math.sin(t)*sx,d=Math.cos(t)*sy+Math.sin(t)*k*sy,cx=w*.4,cy=h/2,u=Math.min(w,h)*.11;x.clearRect(0,0,w,h);
    function P(px,py){return[cx+(a*px+b*py)*u,cy-(cc*px+d*py)*u]}
    x.strokeStyle="#eef1f6";for(var i=-4;i<=4;i++){x.beginPath();x.moveTo(cx+i*u,cy-4*u);x.lineTo(cx+i*u,cy+4*u);x.moveTo(cx-4*u,cy+i*u);x.lineTo(cx+4*u,cy+i*u);x.stroke()}
    x.strokeStyle="rgba(193,60,255,.35)";for(var i=-4;i<=4;i++){var p1=P(i,-4),p2=P(i,4),p3=P(-4,i),p4=P(4,i);x.beginPath();x.moveTo(p1[0],p1[1]);x.lineTo(p2[0],p2[1]);x.moveTo(p3[0],p3[1]);x.lineTo(p4[0],p4[1]);x.stroke()}
    var q=[P(0,0),P(1,0),P(1,1),P(0,1)];x.fillStyle="rgba(242,232,20,.35)";x.beginPath();q.forEach(function(p,i){i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.closePath();x.fill();
    function vec(p,col,lb){x.strokeStyle=col;x.lineWidth=3.5;x.beginPath();x.moveTo(cx,cy);x.lineTo(p[0],p[1]);x.stroke();x.fillStyle=col;x.beginPath();x.arc(p[0],p[1],5,0,7);x.fill();txt(x,lb,p[0]+8,p[1]-8,col,"bold 13px")}
    vec(P(1,0),"#00A6E0","î");vec(P(0,1),"#13A86A","ĵ");
    var mx=w*.74;txt(x,"Matriz",mx,40,DIM,"12px");txt(x,"⎡ "+fmt(a,2)+"   "+fmt(b,2)+" ⎤",mx,68,INK,"15px");txt(x,"⎣ "+fmt(cc,2)+"   "+fmt(d,2)+" ⎦",mx,92,INK,"15px");txt(x,"det = "+fmt(a*d-b*cc,2),mx,128,"#9B3FD9","bold 14px");
    val(c,"mz_r",Math.round(t*180/Math.PI)+"°");val(c,"mz_sx",fmt(sx,2));val(c,"mz_sy",fmt(sy,2));val(c,"mz_k",fmt(k,2));
    o.out.innerHTML="<small>El cuadrado amarillo era de área 1; ahora mide "+fmt(Math.abs(a*d-b*cc),2)+". Si el determinante es 0, el espacio se aplasta en una línea y la matriz no tiene inversa.</small>"};o.draw()};

V["mat-dist"]=function(el){var o=canvas(lab(el,"Distancia euclidiana vs. Manhattan","Arrastra los dos puntos: la euclidiana va en línea recta y la Manhattan sigue las calles, como un taxi en una cuadrícula."));
  controls(o,"");var A=[2,2],B=[7,5],drag=null,u;
  function pos(e){var b=o.c.getBoundingClientRect();return[((e.clientX-b.left)/(o.sc||1)-30)/u,(o.h-30-((e.clientY-b.top)/(o.sc||1)))/u]}
  o.c.style.cursor="grab";o.c.addEventListener("pointerdown",function(e){var p=pos(e);drag=Math.hypot(p[0]-A[0],p[1]-A[1])<Math.hypot(p[0]-B[0],p[1]-B[1])?A:B;o.c.setPointerCapture(e.pointerId)});
  o.c.addEventListener("pointermove",function(e){if(!drag)return;var p=pos(e);drag[0]=clamp(Math.round(p[0]*2)/2,0,10);drag[1]=clamp(Math.round(p[1]*2)/2,0,7);o.draw()});o.c.addEventListener("pointerup",function(){drag=null});
  o.draw=function(){var x=o.x,w=o.w,h=o.h;u=Math.min((w-60)/10,(h-50)/7);var X=function(v){return 30+v*u},Y=function(v){return h-30-v*u};x.clearRect(0,0,w,h);
    x.strokeStyle="#eef1f6";for(var i=0;i<=10;i++){x.beginPath();x.moveTo(X(i),Y(0));x.lineTo(X(i),Y(7));x.stroke()}for(var j=0;j<=7;j++){x.beginPath();x.moveTo(X(0),Y(j));x.lineTo(X(10),Y(j));x.stroke()}
    x.strokeStyle="#C13CFF";x.lineWidth=4;x.beginPath();x.moveTo(X(A[0]),Y(A[1]));x.lineTo(X(B[0]),Y(A[1]));x.lineTo(X(B[0]),Y(B[1]));x.stroke();
    x.strokeStyle="#00A6E0";x.lineWidth=4;x.beginPath();x.moveTo(X(A[0]),Y(A[1]));x.lineTo(X(B[0]),Y(B[1]));x.stroke();
    [A,B].forEach(function(p,i){x.fillStyle="#1f2430";x.beginPath();x.arc(X(p[0]),Y(p[1]),9,0,7);x.fill();txt(x,i?"B":"A",X(p[0]),Y(p[1]),"#fff","bold 11px","center")});
    var de=Math.hypot(B[0]-A[0],B[1]-A[1]),dm=Math.abs(B[0]-A[0])+Math.abs(B[1]-A[1]);
    o.out.innerHTML='<div class="kb-metricas"><span style="color:#0077a8">Euclidiana = <b>'+fmt(de,2)+'</b></span><span style="color:#9B3FD9">Manhattan = <b>'+fmt(dm,2)+'</b></span></div><small>KNN y K-means usan estas distancias para decidir qué tan parecidos son dos clientes. Manhattan es menos sensible a una sola variable muy distinta.</small>'};o.draw()};

/* ---- INTELIGENCIA ARTIFICIAL ---- */
V["ia-norm"]=function(el){var o=canvas(lab(el,"Escalar variables: Min-Max vs. Z-score","Elige el método y agrega un sueldo atípico: verás por qué la escala importa antes de entrenar un modelo."));
  var c=controls(o,seg("nm",["Original","Min-Max","Z-score"],"Original")+'<label class="kb-check"><input type="checkbox" id="nm_out"> Agregar sueldo atípico ($250k)</label>');var m="Original";anim(o);onSeg(c,"nm",function(v){m=v;o.go()});c.querySelector("#nm_out").onchange=function(){o.go()};
  o.draw=function(){var x=o.x,w=o.w,h=o.h,k=o.k==null?1:o.k,S=[12,15,18,20,22,25,28,32,35,40];if(c.querySelector("#nm_out").checked)S=S.concat([250]);var E=[22,25,28,31,35,38,41,45,50,55];if(S.length>10)E=E.concat([45]);
    function tr(arr){if(m==="Original")return arr;var mn=Math.min.apply(null,arr),mx=Math.max.apply(null,arr),mu=arr.reduce(function(a,b){return a+b})/arr.length,sd=Math.sqrt(arr.reduce(function(a,b){return a+(b-mu)*(b-mu)},0)/arr.length);return arr.map(function(v){return m==="Min-Max"?(v-mn)/(mx-mn):(v-mu)/sd})}
    var a=tr(S),b=tr(E),all=a.concat(b),lo=Math.min.apply(null,all),hi=Math.max.apply(null,all);if(m==="Original"){lo=0;hi=hi*1.08}var L=110,W=w-L-30,X=function(v){return L+(v-lo)/(hi-lo||1)*W};x.clearRect(0,0,w,h);
    [[a,"Sueldo (miles $)","#00A6E0",h*.33],[b,"Edad (años)","#C13CFF",h*.66]].forEach(function(r){x.strokeStyle="#e6e9f2";x.beginPath();x.moveTo(L,r[3]);x.lineTo(L+W,r[3]);x.stroke();txt(x,r[1],L-10,r[3],INK,"12px","right");
      r[0].forEach(function(v,i){x.globalAlpha=.85;x.fillStyle=r[2];x.beginPath();x.arc(lerpv(L+W/2,X(v),k),r[3],6,0,7);x.fill();x.globalAlpha=1})});
    txt(x,fmt(lo,m==="Original"?0:2),L,h-18,DIM,"11px","center");txt(x,fmt(hi,m==="Original"?0:2),L+W,h-18,DIM,"11px","center");
    var msg={"Original":"Sueldo y edad en escalas distintas: un modelo basado en distancias le daría casi todo el peso al sueldo.","Min-Max":"Todo entre 0 y 1. Con un atípico, el resto de los datos queda aplastado cerca de 0.","Z-score":"Centrado en 0 con desviación 1: soporta mejor los atípicos y es el más usado en regresión, redes y KNN."};
    o.out.innerHTML="<small>"+msg[m]+"</small>"};function lerpv(a,b,k){return a+(b-a)*k}o.draw()};

V["ia-ensemble"]=function(el){var o=canvas(lab(el,"Ensambles: muchos modelos débiles votan","Agrega modelos que aciertan 65% cada uno y votan por mayoría: la precisión del conjunto sube (si sus errores son independientes)."));
  var c=controls(o,slider("en_n","Número de modelos",1,51,2,9)+slider("en_p","Precisión de cada modelo",51,80,1,65));sliders(o,c,["en_n","en_p"]);
  function comb(n,k){var r=1;for(var i=1;i<=k;i++)r=r*(n-k+i)/i;return r}function acc(n,p){var s=0;for(var k=Math.ceil((n+1)/2);k<=n;k++)s+=comb(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);return s}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,n=+c.querySelector("#en_n").value,p=+c.querySelector("#en_p").value/100,A=acc(n,p),L=40,T=20,W=w*.55-L,H=h-T-38;x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var X=function(k){return L+(k-1)/50*W},Y=function(a){return T+H-(a-.5)/.5*H};x.beginPath();for(var k=1;k<=51;k+=2){k===1?x.moveTo(X(k),Y(acc(k,p))):x.lineTo(X(k),Y(acc(k,p)))}x.strokeStyle=grad(x,L,L+W);x.lineWidth=3;x.stroke();
    x.fillStyle="#C13CFF";x.beginPath();x.arc(X(n),Y(A),6,0,7);x.fill();txt(x,"50%",L-6,Y(.5),DIM,"11px","right");txt(x,"100%",L-6,Y(1),DIM,"11px","right");txt(x,"modelos",L+W,T+H+14,DIM,"11px","right");
    var r=rnd(n*7+Math.round(p*100)),gx=w*.62,cols=Math.ceil(Math.sqrt(n*1.6)),cs=Math.min(26,(w-gx-16)/cols),ok=0;for(var i=0;i<n;i++){var good=r()<p;if(good)ok++;x.fillStyle=good?"#13A86A":"#D64545";rr(x,gx+(i%cols)*cs,T+Math.floor(i/cols)*cs,cs-4,cs-4,5);x.fill()}
    txt(x,"Votos en un caso: "+ok+" ✓ / "+(n-ok)+" ✗ → "+(ok>n/2?"acierta":"falla"),gx,h-16,ok>n/2?"#0e7a4d":"#b53333","bold 12px");val(c,"en_n",n);val(c,"en_p",Math.round(p*100)+"%");
    o.out.innerHTML='<div class="kb-metricas"><span>Precisión individual: <b>'+Math.round(p*100)+'%</b></span><span>Precisión del ensamble: <b class="kb-ok">'+fmt(A*100,1)+'%</b></span></div><small>Es la idea detrás de Random Forest: muchos árboles distintos que votan. En la práctica los errores se parecen entre sí, por eso la mejora real es menor.</small>'};o.draw()};

/* ---- BASES DE DATOS ---- */
V["bd-groupby"]=function(el){var o=canvas(lab(el,"GROUP BY: de muchas filas a un resumen","Elige la función de agregación: cada fila de la tabla viaja a la caja de su ciudad y ahí se calcula un solo valor por grupo."));
  var c=controls(o,seg("ag",["SUM","AVG","COUNT","MAX"],"SUM")+'<button type="button" class="kb-btn kb-btn-pri" id="gb_go">▶ Repetir animación</button>');var f="SUM",k=1,raf=null;
  function go(){cancelAnimationFrame(raf);var t0=null;k=0;raf=requestAnimationFrame(function st(ts){if(t0===null)t0=ts;k=clamp((ts-t0)/2600,0,1);o.draw();if(k<1)raf=requestAnimationFrame(st)})}
  onSeg(c,"ag",function(v){f=v;go()});c.querySelector("#gb_go").onclick=go;
  var R=[["CDMX",820],["GDL",460],["CDMX",1240],["MTY",990],["GDL",310],["CDMX",560],["MTY",720],["GDL",880]],cl={CDMX:"#00A6E0",GDL:"#C13CFF",MTY:"#13A86A"},grp=["CDMX","GDL","MTY"];
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function agg(vs){return f==="SUM"?vs.reduce(function(a,b){return a+b}):f==="AVG"?vs.reduce(function(a,b){return a+b})/vs.length:f==="COUNT"?vs.length:Math.max.apply(null,vs)}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,narrow=w<560,T=narrow?54:44,rh=Math.min(30,(h-T-10)/R.length),tw=narrow?w*.4:w*.3,gx=narrow?w*.47:w*.5,gw=w-gx-10,gh=(h-T-10)/3;x.clearRect(0,0,w,h);
    if(narrow){txt(x,"SELECT ciudad, "+f+"(total)",12,10,INK,"bold 11px");txt(x,"FROM pedidos GROUP BY ciudad;",12,24,INK,"bold 11px")}else txt(x,"SELECT ciudad, "+f+"(total) FROM pedidos GROUP BY ciudad;",12,14,INK,"bold 12px");
    txt(x,"Tabla pedidos",12,T-10,DIM,"11px");txt(x,"Resultado (1 fila por ciudad)",gx,T-10,DIM,"11px");
    grp.forEach(function(g,i){var y=T+i*gh,a=clamp((k-.15)*3,0,1);x.fillStyle="#fff";x.strokeStyle=cl[g];x.lineWidth=2;x.globalAlpha=Math.max(a,.25);rr(x,gx,y,gw,gh-8,10);x.fill();x.stroke();x.globalAlpha=1;txt(x,g,gx+10,y+13,cl[g],"bold 12px")});var cnt={},dur=.55;R.forEach(function(r,i){var sx=12,sy=T+i*rh;x.globalAlpha=.35+.65*(1-Math.min(1,k*1.3));x.fillStyle=cl[r[0]];rr(x,sx,sy,tw,rh-5,5);x.fill();txt(x,r[0]+"   $"+fmt(r[1]),sx+8,sy+(rh-5)/2,"#fff","bold 11px");x.globalAlpha=1;
      var gi=grp.indexOf(r[0]),ci=(cnt[r[0]]=(cnt[r[0]]||0)+1)-1,st=i/R.length*(1-dur),t=ease(clamp((k-st)/dur,0,1)),tx=gx+8+ci*(narrow?(gw-16)/3:62),ty=T+gi*gh+26;
      if(t>0){var px=sx+(tx-sx)*t,py=sy+(ty-sy)*t,cw=tw+((narrow?(gw-16)/3-4:58)-tw)*t;x.fillStyle=cl[r[0]];x.shadowColor="rgba(0,0,0,.18)";x.shadowBlur=t<1?8:0;rr(x,px,py,cw,rh-7,5);x.fill();x.shadowBlur=0;txt(x,(t<.6?r[0]+" ":"")+"$"+fmt(r[1]),px+cw/2,py+(rh-7)/2,"#fff","bold 10px","center")}});
    grp.forEach(function(g,i){var vs=R.filter(function(r){return r[0]===g}).map(function(r){return r[1]}),v=agg(vs),y=T+i*gh,a=clamp((k-.15)*3,0,1),done=clamp((k-.85)/.15,0,1);
      
      if(done>0){x.globalAlpha=done;var ex=f==="COUNT"?vs.length+" filas":f==="MAX"?"máx("+vs.map(function(q){return fmt(q)}).join(", ")+")":f==="AVG"?"("+vs.map(function(q){return fmt(q)}).join("+")+")/"+vs.length:vs.map(function(q){return fmt(q)}).join(" + ");
        txt(x,(narrow?"":ex+"  =  ")+f+" "+(f==="COUNT"?v:"$"+fmt(v)),gx+gw-10,y+gh-22,INK,"bold "+(narrow?"12px":"14px"),"right");x.globalAlpha=1}});
    o.out.innerHTML="<small>"+(k<1?"Agrupando filas por ciudad…":"8 filas se convirtieron en 3: una por ciudad. Si quisieras filtrar después de agrupar (por ejemplo, ciudades con ventas mayores a $2,000) usarías HAVING.")+"</small>"};
  tall(o,320);o.draw()};

V["bd-indice"]=function(el){var o=canvas(lab(el,"Con índice vs. sin índice","Aumenta el número de registros: sin índice hay que revisar fila por fila; con un índice (árbol B) bastan unos cuantos saltos."));
  var c=controls(o,slider("ix_n","Registros en la tabla (potencia de 10)",3,9,0.1,6));sliders(o,c,["ix_n"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,e=+c.querySelector("#ix_n").value,n=Math.pow(10,e),seq=n/2,idx=Math.ceil(Math.log(n)/Math.log(100))+1,L=150,W=w-L-130,mx=9;x.clearRect(0,0,w,h);
    [["Sin índice (secuencial)",seq,"#D64545"],["Con índice (árbol B)",idx,"#13A86A"]].forEach(function(r,i){var y=40+i*80,bw=Math.max(4,Math.log10(Math.max(r[1],1))/mx*W);txt(x,r[0],L-10,y+16,INK,"12px","right");x.fillStyle="#eef1f6";rr(x,L,y,W,32,8);x.fill();x.fillStyle=r[2];rr(x,L,y,bw,32,8);x.fill();txt(x,fmt(r[1])+" lecturas",L+bw+10,y+16,INK,"bold 12px")});
    var ms=seq*0.0001;txt(x,"Escala logarítmica",L,h-20,DIM,"11px");val(c,"ix_n",fmt(n));
    o.out.innerHTML='<div class="kb-metricas"><span>Sin índice: <b>~'+(ms<1000?fmt(ms,1)+" ms":fmt(ms/1000,1)+" s")+'</b></span><span>Con índice: <b>~'+fmt(idx*0.05,2)+' ms</b></span></div><small>Tiempos ilustrativos. Por eso conviene indexar las columnas por las que más filtras o unes (id_cliente, fecha).</small>'};o.draw()};

/* ---- SISTEMAS OPERATIVOS ---- */
V["so-venv"]=function(el){var o=canvas(lab(el,"¿Por qué usar entornos virtuales?","Dos proyectos necesitan versiones distintas de pandas. Activa los entornos virtuales y mira cómo desaparece el conflicto."));
  var c=controls(o,'<label class="kb-check"><input type="checkbox" id="vv_on"> Usar un entorno virtual por proyecto</label>');anim(o);c.querySelector("#vv_on").onchange=function(){o.go()};
  o.draw=function(){var x=o.x,w=o.w,h=o.h,on=c.querySelector("#vv_on").checked,k=o.k==null?1:o.k;x.clearRect(0,0,w,h);
    var P=[["Proyecto A · pronóstico","pandas 1.5",w*.22],["Proyecto B · dashboard","pandas 2.2",w*.72]];
    P.forEach(function(p){x.fillStyle="#1f2430";rr(x,p[2]-90,20,180,42,10);x.fill();txt(x,p[0],p[2],41,"#fff","bold 12px","center");txt(x,"requiere "+p[1],p[2],76,DIM,"12px","center")});
    if(!on){var gx=w/2,gy=h-70;x.globalAlpha=k;x.fillStyle="#fdecec";x.strokeStyle="#D64545";x.lineWidth=2;rr(x,gx-150,gy-26,300,60,12);x.fill();x.stroke();txt(x,"Python global: solo cabe una versión",gx,gy-6,"#b53333","bold 12px","center");txt(x,"pandas 2.2 instalado → el proyecto A falla",gx,gy+16,"#b53333","12px","center");
      P.forEach(function(p){x.strokeStyle="#D64545";x.setLineDash([5,4]);x.beginPath();x.moveTo(p[2],88);x.lineTo(gx,gy-28);x.stroke();x.setLineDash([])});x.globalAlpha=1}
    else{P.forEach(function(p){x.globalAlpha=k;x.fillStyle="#e9f9ef";x.strokeStyle="#13A86A";x.lineWidth=2;rr(x,p[2]-90,h-110,180,70,12);x.fill();x.stroke();txt(x,".venv propio",p[2],h-88,"#0e7a4d","bold 12px","center");txt(x,p[1]+" ✓",p[2],h-64,"#0e7a4d","12px","center");
      x.strokeStyle="#13A86A";x.beginPath();x.moveTo(p[2],88);x.lineTo(p[2],h-112);x.stroke();x.globalAlpha=1})}
    o.out.innerHTML="<small>"+(on?"Cada proyecto tiene sus librerías aisladas y un requirements.txt para que cualquiera lo reproduzca.":"Sin entornos, instalar una librería para un proyecto puede romper otro que ya funcionaba.")+"</small>"};o.draw()};

V["so-docker"]=function(el){var o=canvas(lab(el,"Docker: la imagen se construye por capas","Avanza paso a paso el Dockerfile: cada instrucción agrega una capa y al final la misma imagen corre en cualquier máquina."));
  var c=controls(o,slider("dk_s","Paso del Dockerfile",0,6,1,4)+'<button type="button" class="kb-btn kb-btn-pri" id="dk_play">▶ Construir</button>');var tm=null;
  var S=[["FROM python:3.11-slim","sistema base con Python"],["WORKDIR /app","carpeta de trabajo"],["COPY requirements.txt .","lista de librerías"],["RUN pip install -r requirements.txt","instala dependencias"],["COPY . .","copia tu código y el modelo"],["CMD [\"python\", \"app.py\"]","comando al arrancar"]],cols=["#1f2430","#2d3448","#5a3fb8","#9B3FD9","#00A6E0","#13A86A"];
  c.querySelector("#dk_s").oninput=function(){o.draw()};c.querySelector("#dk_play").onclick=function(){clearInterval(tm);var s=c.querySelector("#dk_s");s.value=0;o.draw();tm=setInterval(function(){s.value=+s.value+1;o.draw();if(+s.value>=6)clearInterval(tm)},600)};
  o.draw=function(){var x=o.x,w=o.w,h=o.h,st=+c.querySelector("#dk_s").value,lh=(h-40)/6.4,bx=24,bw=w*.52;x.clearRect(0,0,w,h);
    for(var i=0;i<st;i++){var y=h-20-(i+1)*lh;x.fillStyle=cols[i];rr(x,bx,y,bw,lh-5,7);x.fill();txt(x,S[i][0],bx+12,y+(lh-5)/2,"#fff","12px");txt(x,S[i][1],bx+bw+10,y+(lh-5)/2,DIM,"11px")}
    if(st===0)txt(x,"Imagen vacía: avanza el paso",bx,h/2,DIM,"13px");
    if(st===6){var mach=["Tu laptop","Servidor Linux","Nube"];mach.forEach(function(m,i){var mx=w*.78,my=30+i*((h-60)/3);x.fillStyle="#e9f9ef";x.strokeStyle="#13A86A";x.lineWidth=1.5;rr(x,mx,my,w*.2,40,8);x.fill();x.stroke();txt(x,m+" ✓",mx+w*.1,my+20,"#0e7a4d","bold 12px","center")})}
    val(c,"dk_s",st+"/6");o.out.innerHTML="<small>"+(st===6?"Imagen lista: el mismo contenedor corre igual en tu laptop, en un servidor y en la nube. Adiós al “en mi máquina sí funciona”.":"Docker guarda cada capa en caché: si solo cambias tu código, no reinstala las librerías.")+"</small>"};o.draw()};

/* ---- STORYTELLING ---- */
V["st-eje"]=function(el){var o=canvas(lab(el,"El eje que no empieza en cero","Mueve dónde empieza el eje vertical: la diferencia real es de 2.5 puntos, pero la gráfica puede hacerla parecer enorme."));
  var c=controls(o,slider("ej_y","El eje empieza en",0,96,1,0));sliders(o,c,["ej_y"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,y0=+c.querySelector("#ej_y").value,v=[97.5,100],L=50,T=24,W=w*.55-L,H=h-T-40,Y=function(q){return T+H-(q-y0)/(100-y0)*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    ["Sucursal A","Sucursal B"].forEach(function(n,i){var bx=L+W*(.18+i*.42),bw=W*.26;x.fillStyle=i?"#1e88e5":"#9aa3b5";rr(x,bx,Y(v[i]),bw,T+H-Y(v[i]),4);x.fill();txt(x,v[i]+"%",bx+bw/2,Y(v[i])-12,INK,"bold 12px","center");txt(x,n,bx+bw/2,T+H+14,DIM,"11px","center")});
    for(var i=0;i<=4;i++){var q=y0+(100-y0)*i/4;txt(x,fmt(q,1),L-8,Y(q),DIM,"11px","right")}
    var ratio=(100-y0)/(97.5-y0);x.font="bold 34px system-ui";x.fillStyle=y0>50?"#D64545":"#13A86A";x.textAlign="left";x.fillText("×"+fmt(ratio,2),w*.64,h*.42);txt(x,"B parece esta cantidad de veces más alta que A",w*.64,h*.42+28,DIM,"12px");
    val(c,"ej_y",y0);o.out.innerHTML="<small>"+(y0===0?"Con el eje en cero, la diferencia se ve tal como es: pequeña.":"Ojo: la diferencia real sigue siendo 2.5 puntos (2.6%), pero la barra de B se ve "+fmt(ratio,1)+" veces más alta. En barras, el eje siempre debe empezar en cero.")+"</small>"};o.draw()};

V["st-chart"]=function(el){var o=canvas(lab(el,"¿Qué gráfica uso?","Elige la pregunta que quieres responder y aparece la gráfica adecuada para esa pregunta."));
  var c=controls(o,seg("ch",["Comparar categorías","Tendencia en el tiempo","Distribución","Relación","Partes de un todo"],"Comparar categorías"));var q="Comparar categorías";anim(o);onSeg(c,"ch",function(v){q=v;o.go()});
  o.draw=function(){var x=o.x,w=o.w,h=o.h,k=o.k==null?1:o.k,L=40,T=26,W=w-L-30,H=h-T-30,r=rnd(5);x.clearRect(0,0,w,h);
    if(q==="Comparar categorías"){var v=[74,55,50,47,42,38,33],n=["Norte","Sur","Sureste","Golfo","Centro","Bajío","Pacífico"];v.forEach(function(a,i){var y=T+i*(H/7);txt(x,n[i],L+60,y+H/14,INK,"12px","right");x.fillStyle=i?"#c4c9d4":"#1e88e5";rr(x,L+70,y+4,a/80*(W-80)*k,H/7-8,4);x.fill()});txt(x,"Barras horizontales ordenadas",L,12,DIM,"12px")}
    else if(q==="Tendencia en el tiempo"){x.strokeStyle=grad(x,L,L+W);x.lineWidth=3;x.beginPath();for(var i=0;i<=24*k;i++){var y=T+H-(.3+i/40+Math.sin(i/2)*.06)*H;i?x.lineTo(L+i/24*W,y):x.moveTo(L,y)}x.stroke();txt(x,"Línea: el tiempo siempre en el eje horizontal",L,12,DIM,"12px")}
    else if(q==="Distribución"){var B=new Array(20).fill(0);for(var i=0;i<600;i++){var g=gauss(r),b=Math.floor((g+3.3)/6.6*20);if(b>=0&&b<20)B[b]++}var mx=Math.max.apply(null,B);B.forEach(function(b,i){x.fillStyle="#9B3FD9";rr(x,L+i*W/20+1,T+H-b/mx*H*k,W/20-2,b/mx*H*k,2);x.fill()});txt(x,"Histograma: muestra la forma, no solo el promedio",L,12,DIM,"12px")}
    else if(q==="Relación"){for(var i=0;i<70;i++){var a=r(),b=a*.8+r()*.25;x.fillStyle="rgba(0,166,224,.7)";x.beginPath();x.arc(L+a*W,T+H-b*H*k,4,0,7);x.fill()}x.strokeStyle="#1f2430";x.setLineDash([5,4]);x.beginPath();x.moveTo(L,T+H-.12*H);x.lineTo(L+W,T+H-.92*H);x.stroke();x.setLineDash([]);txt(x,"Dispersión con línea de tendencia",L,12,DIM,"12px")}
    else{var p=[.62,.38],acc=0,cols=["#1e88e5","#c4c9d4"],lb=["Digital 62%","Tienda 38%"];p.forEach(function(v,i){x.fillStyle=cols[i];rr(x,L+acc*W*k,T+H*.3,v*W*k-3,H*.35,6);x.fill();txt(x,lb[i],L+(acc+v/2)*W*k,T+H*.47,i?"#1f2430":"#fff","bold 13px","center");acc+=v});txt(x,"Barra apilada al 100% (pastel solo con 2 o 3 partes)",L,12,DIM,"12px")}
    var ev={"Comparar categorías":"Evita: pastel con muchas rebanadas o barras sin ordenar.","Tendencia en el tiempo":"Evita: barras con decenas de periodos.","Distribución":"Evita: mostrar solo el promedio, oculta los extremos.","Relación":"Evita: doble eje vertical.","Partes de un todo":"Evita: pastel con más de 5 rebanadas o dona 3D."};o.out.innerHTML="<small>"+ev[q]+"</small>"};o.draw()};

/* ---- AZURE ---- */
V["az-escala"]=function(el){var o=canvas(lab(el,"Escalabilidad: capacidad fija vs. autoescalado","Compara un servidor de tamaño fijo con el autoescalado durante un día de ventas: cambia el pico de demanda y la capacidad."));
  var c=controls(o,seg("es",["Capacidad fija","Autoescalado"],"Capacidad fija")+slider("es_p","Pico de demanda (Buen Fin)",1,3,0.1,1.8)+slider("es_c","Servidores fijos",2,10,1,5));var m="Capacidad fija";onSeg(c,"es",function(v){m=v;o.draw()});sliders(o,c,["es_p","es_c"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,pk=+c.querySelector("#es_p").value,cap=+c.querySelector("#es_c").value,L=40,T=18,W=w-L-20,H=h-T-38,mx=10,D=[];for(var i=0;i<=24;i++)D.push(Math.min(9.8,(1.2+2.2*Math.exp(-Math.pow((i-13)/3.2,2))+1.8*Math.exp(-Math.pow((i-20)/2,2)))*pk));
    var X=function(i){return L+i/24*W},Y=function(v){return T+H-v/mx*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);var over=0,cost=0;
    for(var i=0;i<24;i++){var s=m==="Autoescalado"?Math.ceil(D[i]):cap;cost+=s;if(D[i]>s)over++;x.fillStyle=D[i]>s?"rgba(214,69,69,.25)":"rgba(25,227,107,.18)";x.fillRect(X(i)+1,Y(s),W/24-2,T+H-Y(s))}
    x.beginPath();D.forEach(function(v,i){i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v))});x.strokeStyle="#1f2430";x.lineWidth=2.5;x.stroke();
    for(var i=0;i<=24;i+=6)txt(x,i+":00",X(i),T+H+14,DIM,"11px","center");txt(x,"servidores",L-34,T+6,DIM,"11px");val(c,"es_p","×"+fmt(pk,1));val(c,"es_c",cap);
    o.out.innerHTML='<div class="kb-metricas"><span>Horas saturadas: <b class="'+(over?"kb-alerta":"kb-ok")+'">'+over+'</b></span><span>Horas-servidor pagadas: <b>'+cost+'</b></span></div><small>Verde: capacidad suficiente. Rojo: la demanda supera la capacidad (página lenta o caída). El autoescalado agrega servidores solo cuando se necesitan.</small>'};o.draw()};

V["az-latencia"]=function(el){var o=canvas(lab(el,"Latencia: la distancia sí importa","Elige dónde está el servidor: el paquete viaja de ida y vuelta y verás por qué conviene una región cercana a tus usuarios en CDMX."));
  var Rg=[["Misma ciudad",4],["Centro de México",12],["Sur de EE. UU.",38],["Este de EE. UU.",62],["Brasil",110],["Europa",150],["Asia",230]],sel=2,t0=performance.now();
  var c=controls(o,'<span class="kb-seg">'+Rg.map(function(r,i){return '<button type="button" class="kb-btn'+(i===sel?' activo':'')+'" data-lt="'+i+'">'+r[0]+'</button>'}).join("")+'</span>');onSeg(c,"lt",function(v){sel=+v;t0=performance.now()});
  function loop(){if(!document.body.contains(o.c))return;o.draw();requestAnimationFrame(loop)}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,ms=Rg[sel][1],ax=60,bx=60+(w-140)*(Math.log(ms+1)/Math.log(231)),y=h*.38;x.clearRect(0,0,w,h);
    x.strokeStyle="#e6e9f2";x.lineWidth=2;x.setLineDash([6,6]);x.beginPath();x.moveTo(ax,y);x.lineTo(bx,y);x.stroke();x.setLineDash([]);
    x.fillStyle="#1f2430";rr(x,ax-36,y-20,72,40,8);x.fill();txt(x,"Usuario CDMX",ax,y,"#fff","bold 10px","center");x.fillStyle="#9B3FD9";rr(x,bx-34,y-20,68,40,8);x.fill();txt(x,"Servidor",bx,y,"#fff","bold 10px","center");
    var per=Math.max(500,ms*2*8),f=((performance.now()-t0)%per)/per,px=f<.5?ax+(bx-ax)*f*2:bx-(bx-ax)*(f-.5)*2;x.fillStyle="#F2A814";x.beginPath();x.arc(px,y,7,0,7);x.fill();
    var L=150,W=w-L-80;Rg.forEach(function(r,i){var yy=h*.6+i*((h*.38)/Rg.length),bw=r[1]/230*W;x.fillStyle=i===sel?"#9B3FD9":"#d5dbe6";rr(x,L,yy,Math.max(3,bw),(h*.38)/Rg.length-4,3);x.fill();txt(x,r[0],L-8,yy+((h*.38)/Rg.length-4)/2,i===sel?INK:DIM,"11px","right");txt(x,r[1]+" ms",L+bw+6,yy+((h*.38)/Rg.length-4)/2,DIM,"10px")});
    o.out.innerHTML='<div class="kb-metricas"><span>Ida y vuelta: <b>'+ms+' ms</b></span><span>10 consultas seguidas: <b>'+fmt(ms*10)+' ms</b></span></div><small>Valores ilustrativos. Para una API de modelo que responde en tiempo real, unos cuantos milisegundos por consulta se suman rápido.</small>'};
  requestAnimationFrame(loop)};

/* ---- INGENIERÍA DE VARIABLES ---- */
V["iv-ratio"]=function(el){var o=canvas(lab(el,"Ratio de utilización de la línea de crédito","Mueve el saldo y el límite: la utilización hace comparables a clientes de distinto tamaño, y arriba de 80% es señal de alerta."));
  var c=controls(o,slider("ur_s","Saldo actual ($)",0,100000,500,32000)+slider("ur_l","Límite de crédito ($)",5000,100000,500,40000));sliders(o,c,["ur_s","ur_l"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,s=+c.querySelector("#ur_s").value,l=+c.querySelector("#ur_l").value,u=Math.min(s/l,1.2),cx=w*.3,cy=h*.78,R=Math.min(w*.24,h*.62);x.clearRect(0,0,w,h);
    [[0,.5,"#13A86A"],[.5,.8,"#F2A814"],[.8,1.2,"#D64545"]].forEach(function(z){x.strokeStyle=z[2];x.lineWidth=R*.18;x.beginPath();x.arc(cx,cy,R,Math.PI+z[0]/1.2*Math.PI,Math.PI+z[1]/1.2*Math.PI);x.stroke()});
    var a=Math.PI+u/1.2*Math.PI;x.strokeStyle="#1f2430";x.lineWidth=4;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*R*.85,cy+Math.sin(a)*R*.85);x.stroke();x.fillStyle="#1f2430";x.beginPath();x.arc(cx,cy,8,0,7);x.fill();
    txt(x,fmt(s/l*100,0)+"%",cx,cy-R*.35,INK,"bold 26px","center");
    var lv=u>.8?["Riesgo alto","#D64545"]:u>.5?["Vigilar","#a8641c"]:["Saludable","#0e7a4d"];txt(x,lv[0],w*.62,h*.35,lv[1],"bold 22px");txt(x,"Utilización = Saldo / Límite",w*.62,h*.35+30,DIM,"12px");txt(x,"$"+fmt(s)+" / $"+fmt(l),w*.62,h*.35+50,INK,"13px");
    val(c,"ur_s","$"+fmt(s));val(c,"ur_l","$"+fmt(l));o.out.innerHTML="<small>Un cliente con $8,000 de saldo y $10,000 de límite (80%) es más riesgoso que uno con $30,000 de saldo y $100,000 de límite (30%), aunque deba menos.</small>"};o.draw()};

V["iv-ciclo"]=function(el){var o=canvas(lab(el,"Estacionalidad con seno y coseno","Mueve el mes: con números 1 a 12, diciembre y enero quedan lejos; en el círculo de seno y coseno quedan juntos, como en la realidad."));
  var c=controls(o,slider("cy_m","Mes",1,12,1,12));sliders(o,c,["cy_m"]);var M=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,m=+c.querySelector("#cy_m").value,L=30,W=w*.42-L,ly=h*.3;x.clearRect(0,0,w,h);
    txt(x,"Como número (1–12)",L,22,INK,"bold 12px");x.strokeStyle="#e6e9f2";x.lineWidth=2;x.beginPath();x.moveTo(L,ly);x.lineTo(L+W,ly);x.stroke();
    for(var i=1;i<=12;i++){var px=L+(i-1)/11*W;x.fillStyle=i===m?"#C13CFF":(i===(m%12)+1?"#00A6E0":"#c4c9d4");x.beginPath();x.arc(px,ly,i===m?8:5,0,7);x.fill();if(i===1||i===12||i===m)txt(x,M[i-1],px,ly+20,DIM,"11px","center")}
    var cx=w*.72,cy=h*.52,R=Math.min(h*.36,w*.2);txt(x,"Como (seno, coseno)",cx-R,22,INK,"bold 12px");x.strokeStyle="#e6e9f2";x.beginPath();x.arc(cx,cy,R,0,7);x.stroke();
    for(var i=1;i<=12;i++){var a=2*Math.PI*i/12-Math.PI/2,px=cx+Math.cos(a)*R,py=cy+Math.sin(a)*R;x.fillStyle=i===m?"#C13CFF":(i===(m%12)+1?"#00A6E0":"#c4c9d4");x.beginPath();x.arc(px,py,i===m?8:5,0,7);x.fill();txt(x,M[i-1],cx+Math.cos(a)*(R+18),cy+Math.sin(a)*(R+18),DIM,"10px","center")}
    var n2=(m%12)+1,dl=Math.abs(n2-m),a1=2*Math.PI*m/12,a2=2*Math.PI*n2/12,dc=Math.hypot(Math.sin(a1)-Math.sin(a2),Math.cos(a1)-Math.cos(a2));
    val(c,"cy_m",M[m-1]);o.out.innerHTML='<div class="kb-metricas"><span>'+M[m-1]+' → '+M[n2-1]+' como número: <b>'+dl+'</b></span><span>en el círculo: <b>'+fmt(dc,2)+'</b></span><span>sin = <b>'+fmt(Math.sin(a1),2)+'</b>, cos = <b>'+fmt(Math.cos(a1),2)+'</b></span></div><small>Con el número, el modelo cree que diciembre y enero están a 11 meses de distancia. Con seno y coseno entiende que son vecinos.</small>'};o.draw()};

V["iv-rfm"]=function(el){var o=canvas(lab(el,"Segmentación RFM de un cliente","Mueve recencia, frecuencia y monto: cada medida se convierte en un puntaje de 1 a 5 y la combinación define el segmento."));
  var c=controls(o,slider("rf_r","Días desde la última compra",1,365,1,20)+slider("rf_f","Compras en el año",1,60,1,18)+slider("rf_m","Gasto en el año ($)",100,50000,100,9000));sliders(o,c,["rf_r","rf_f","rf_m"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,r=+c.querySelector("#rf_r").value,f=+c.querySelector("#rf_f").value,m=+c.querySelector("#rf_m").value,R=r<=15?5:r<=45?4:r<=90?3:r<=180?2:1,F=f>=30?5:f>=15?4:f>=6?3:f>=3?2:1,Mm=m>=20000?5:m>=8000?4:m>=3000?3:m>=1000?2:1;x.clearRect(0,0,w,h);
    var S=[["Recencia",R,"#00A6E0"],["Frecuencia",F,"#C13CFF"],["Monto",Mm,"#13A86A"]],L=100,W=w*.5-L;S.forEach(function(s,i){var y=30+i*((h-50)/3);txt(x,s[0],L-10,y+16,INK,"12px","right");for(var k=1;k<=5;k++){x.fillStyle=k<=s[1]?s[2]:"#eef1f6";rr(x,L+(k-1)*W/5,y,W/5-6,32,6);x.fill()}txt(x,s[1]+"/5",L+W+8,y+16,INK,"bold 13px")});
    var seg=R>=4&&F>=4&&Mm>=4?["Campeón","Premiar y pedir reseñas","#0e7a4d"]:R>=4&&F<=2?["Nuevo","Darle la bienvenida y una segunda compra","#0077a8"]:R<=2&&F>=3?["En riesgo","Campaña de recuperación ya","#b53333"]:R<=1?["Perdido","Oferta fuerte o dejarlo ir","#6b7280"]:F>=3?["Leal","Programa de lealtad","#9B3FD9"]:["Potencial","Promociones para subir frecuencia","#a8641c"];
    x.fillStyle=seg[2];rr(x,w*.62,h*.28,w*.34,h*.44,14);x.fill();txt(x,"RFM "+R+F+Mm,w*.79,h*.36,"rgba(255,255,255,.8)","12px","center");txt(x,seg[0],w*.79,h*.48,"#fff","bold 22px","center");txt(x,seg[1],w*.79,h*.6,"#fff","11px","center");
    val(c,"rf_r",r+" d");val(c,"rf_f",f);val(c,"rf_m","$"+fmt(m));o.out.innerHTML="<small>Umbrales ilustrativos: en un proyecto real se calculan con quintiles de tus propios clientes.</small>"};o.draw()};


/* ================= Laboratorios: tercera tanda ================= */
function bars(x,vals,X0,W,T,H,mx,colf){var bw=W/vals.length;vals.forEach(function(v,i){var bh=v/mx*H;x.fillStyle=colf(i);rr(x,X0+i*bw+1,T+H-bh,bw-2,bh,2);x.fill()})}
function dots1d(x,arr,X,y,col){arr.forEach(function(v){x.fillStyle=col;x.globalAlpha=.75;x.beginPath();x.arc(X(v),y,6,0,7);x.fill();x.globalAlpha=1})}
function vline(x,X,T,H,col,lb,dy){x.strokeStyle=col;x.lineWidth=2.5;x.beginPath();x.moveTo(X,T);x.lineTo(X,T+H);x.stroke();if(lb)txt(x,lb,X+6,T+(dy||10),col,"bold 12px")}

/* ---- ESTADÍSTICA ---- */
V["est-media"]=function(el){var o=canvas(lab(el,"Media vs. mediana con un dato atípico","Arrastra el valor del cliente atípico: la media se va detrás de él, la mediana casi no se mueve."));
  var c=controls(o,slider("md_o","Compra del cliente atípico ($)",400,20000,100,400));sliders(o,c,["md_o"]);var base=[220,260,300,320,350,380,410,450,500];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,ov=+c.querySelector("#md_o").value,d=base.concat([ov]).sort(function(a,b){return a-b}),mean=d.reduce(function(a,b){return a+b})/d.length,med=(d[4]+d[5])/2,hi=Math.max(1000,ov*1.08),L=30,W=w-L-30,X=function(v){return L+v/hi*W},y=h*.45;x.clearRect(0,0,w,h);
    x.strokeStyle="#e6e9f2";x.lineWidth=2;x.beginPath();x.moveTo(L,y);x.lineTo(L+W,y);x.stroke();dots1d(x,d,X,y,"#1f2430");
    vline(x,X(med),y-90,180,"#13A86A","mediana $"+fmt(med),12);vline(x,X(mean),y-90,180,"#C13CFF","media $"+fmt(mean),40);
    for(var t=0;t<=hi;t+=hi>5000?5000:250)txt(x,"$"+fmt(t),X(t),h-16,DIM,"11px","center");val(c,"md_o","$"+fmt(ov));
    o.out.innerHTML='<div class="kb-metricas"><span style="color:#9B3FD9">Media = <b>$'+fmt(mean)+'</b></span><span style="color:#0e7a4d">Mediana = <b>$'+fmt(med)+'</b></span></div><small>Con un solo cliente que compra mucho, el "ticket promedio" deja de representar al cliente típico. Por eso en sueldos, precios de casas o tickets se reporta la mediana.</small>'};o.draw()};

V["est-var"]=function(el){var o=canvas(lab(el,"Varianza y desviación estándar","Mueve la dispersión: dos sucursales pueden vender lo mismo en promedio y ser muy distintas en estabilidad."));
  var c=controls(o,slider("vr_a","Dispersión sucursal A",2,40,1,8)+slider("vr_b","Dispersión sucursal B",2,40,1,30));sliders(o,c,["vr_a","vr_b"]);var r=rnd(31),Z=[];for(var i=0;i<30;i++)Z.push(gauss(r));
  o.draw=function(){var x=o.x,w=o.w,h=o.h,sa=+c.querySelector("#vr_a").value,sb=+c.querySelector("#vr_b").value,L=110,W=w-L-30,X=function(v){return L+(v-0)/200*W};x.clearRect(0,0,w,h);
    [["Sucursal A",sa,"#00A6E0",h*.3],["Sucursal B",sb,"#C13CFF",h*.68]].forEach(function(s){var d=Z.map(function(z){return clamp(100+z*s[1],2,198)}),m=d.reduce(function(a,b){return a+b})/d.length,sd=Math.sqrt(d.reduce(function(a,b){return a+(b-m)*(b-m)},0)/d.length);
      x.fillStyle="rgba(0,0,0,.04)";x.fillRect(X(m-sd),s[3]-26,X(m+sd)-X(m-sd),52);x.strokeStyle="#e6e9f2";x.beginPath();x.moveTo(L,s[3]);x.lineTo(L+W,s[3]);x.stroke();dots1d(x,d,X,s[3],s[2]);
      vline(x,X(m),s[3]-30,60,"#1f2430");txt(x,s[0],L-10,s[3]-8,INK,"bold 12px","right");txt(x,"σ = "+fmt(sd,1),L-10,s[3]+10,s[2],"12px","right")});
    for(var t=0;t<=200;t+=50)txt(x,t,X(t),h-14,DIM,"11px","center");val(c,"vr_a",sa);val(c,"vr_b",sb);
    o.out.innerHTML='<small>Ambas venden ~100 piezas al día en promedio. La franja gris es ±1σ. Con σ grande hay que tener más inventario de seguridad porque la demanda es impredecible.</small>'};o.draw()};

V["est-sesgo"]=function(el){var o=canvas(lab(el,"Asimetría (sesgo): dónde quedan media, mediana y moda","Mueve la asimetría: con cola a la derecha la media se aleja hacia la cola; con cola a la izquierda pasa lo contrario."));
  var c=controls(o,slider("sg_a","Asimetría",-6,6,0.5,3));sliders(o,c,["sg_a"]);
  function sn(x0,a){return 2*pdf(x0,0,1)*Phi(a*x0)}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,a=+c.querySelector("#sg_a").value,L=30,T=20,W=w-L-20,H=h-T-38,lo=-4,hi=4,X=function(v){return L+(v-lo)/(hi-lo)*W},mx=0,mode=0,pts=[];x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    for(var v=lo;v<=hi;v+=.01){var p=sn(v,a);pts.push([v,p]);if(p>mx){mx=p;mode=v}}var dl=a/Math.sqrt(1+a*a),mean=dl*Math.sqrt(2/Math.PI),cum=0,tot=pts.reduce(function(s,q){return s+q[1]},0),med=0;for(var i=0;i<pts.length;i++){cum+=pts[i][1];if(cum>=tot/2){med=pts[i][0];break}}
    x.beginPath();x.moveTo(X(lo),T+H);pts.forEach(function(q){x.lineTo(X(q[0]),T+H-q[1]/mx*H*.9)});x.lineTo(X(hi),T+H);x.closePath();x.globalAlpha=.25;x.fillStyle=grad(x,L,L+W);x.fill();x.globalAlpha=1;x.strokeStyle=grad(x,L,L+W);x.lineWidth=2.5;x.stroke();
    vline(x,X(mode),T,H,"#1f2430","moda",10);vline(x,X(med),T,H,"#13A86A","mediana",28);vline(x,X(mean),T,H,"#C13CFF","media",46);val(c,"sg_a",fmt(a,1));
    o.out.innerHTML="<small>"+(a>0?"Sesgo positivo (cola a la derecha): típico de ingresos, tiempos de espera o montos de compra. Media > mediana > moda.":a<0?"Sesgo negativo (cola a la izquierda): por ejemplo, calificaciones de un examen fácil. Media < mediana < moda.":"Simétrica: media, mediana y moda coinciden.")+"</small>"};o.draw()};

V["est-wil"]=function(el){var o=canvas(lab(el,"Promedio vs. prueba de rangos (Wilcoxon)","Agranda el atípico de una semana: el promedio de la diferencia se dispara, pero los rangos (lo que usa Wilcoxon) no cambian."));
  var c=controls(o,slider("wl_o","Merma de la semana atípica",5,200,1,8));sliders(o,c,["wl_o"]);var D=[2,3,-1,4,2,5,3,-2,4,3];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,ov=+c.querySelector("#wl_o").value,d=D.concat([ov]),mean=d.reduce(function(a,b){return a+b})/d.length,abs=d.map(function(v,i){return[Math.abs(v),i]}).sort(function(a,b){return a[0]-b[0]}),rk=[];abs.forEach(function(q,j){rk[q[1]]=j+1});
    var wp=0,wn=0;d.forEach(function(v,i){if(v>0)wp+=rk[i];else wn+=rk[i]});var L=40,T=24,W=w*.55-L,H=h-T-40,mxv=Math.max(10,ov),bw=W/d.length;x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var Y=function(v){return T+H*.8-v/mxv*H*.75};d.forEach(function(v,i){x.fillStyle=v<0?"#D64545":(i===d.length-1?"#C13CFF":"#00A6E0");var y0=Y(0),y1=Y(v);rr(x,L+i*bw+3,Math.min(y0,y1),bw-6,Math.abs(y1-y0)||2,3);x.fill();txt(x,"r"+rk[i],L+i*bw+bw/2,T+H+12,DIM,"10px","center")});
    txt(x,"diferencia semanal (rango debajo)",L,12,DIM,"11px");var gx=w*.62;txt(x,"Promedio de la diferencia",gx,h*.28,DIM,"12px");txt(x,fmt(mean,1),gx,h*.28+28,"#9B3FD9","bold 26px");txt(x,"Suma de rangos + / −",gx,h*.62,DIM,"12px");txt(x,wp+" / "+wn,gx,h*.62+28,"#0e7a4d","bold 26px");val(c,"wl_o",ov);
    o.out.innerHTML="<small>El promedio pasó de ~2.3 a "+fmt(mean,1)+" por una sola semana; la suma de rangos solo cambia si el atípico cambia de signo. Por eso Wilcoxon es más confiable con datos irregulares.</small>"};o.draw()};

V["est-corr"]=function(el){var o=canvas(lab(el,"Correlación: de −1 a 1","Mueve el coeficiente: la nube de puntos pasa de bajar, a no tener relación, a subir. Recuerda: correlación no es causalidad."));
  var c=controls(o,slider("cr_r","Correlación r",-1,1,0.05,0.7));sliders(o,c,["cr_r"]);var r0=rnd(41),Z=[];for(var i=0;i<120;i++)Z.push([gauss(r0),gauss(r0)]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,rho=+c.querySelector("#cr_r").value,L=40,T=16,W=w*.62-L,H=h-T-30,X=function(v){return L+(v+3)/6*W},Y=function(v){return T+H-(v+3)/6*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    Z.forEach(function(z){var yv=rho*z[0]+Math.sqrt(Math.max(0,1-rho*rho))*z[1];x.fillStyle="rgba(31,36,48,.55)";x.beginPath();x.arc(X(clamp(z[0],-3,3)),Y(clamp(yv,-3,3)),3.5,0,7);x.fill()});
    x.strokeStyle=grad(x,L,L+W);x.lineWidth=3;x.beginPath();x.moveTo(X(-3),Y(-3*rho));x.lineTo(X(3),Y(3*rho));x.stroke();
    var gx=w*.68,ab=Math.abs(rho),lv=ab>=.8?"muy fuerte":ab>=.5?"moderada":ab>=.2?"débil":"casi nula";txt(x,"r = "+fmt(rho,2),gx,h*.3,INK,"bold 28px");txt(x,"Relación "+lv+(rho>0?" positiva":rho<0?" negativa":""),gx,h*.3+30,DIM,"13px");txt(x,"r² = "+fmt(rho*rho*100,0)+"% de varianza compartida",gx,h*.3+52,DIM,"12px");
    val(c,"cr_r",fmt(rho,2));o.out.innerHTML="<small>Ejemplo clásico: las ventas de helado y los ahogamientos se correlacionan, pero la causa común es el calor. Antes de concluir, busca la variable escondida.</small>"};o.draw()};

V["est-indep"]=function(el){var o=canvas(lab(el,"Independencia de errores (residuales)","Sube la autocorrelación: los residuales dejan de ser ruido y forman olas, señal de que el modelo ignora un patrón en el tiempo."));
  var c=controls(o,slider("id_p","Autocorrelación de los errores ρ",0,0.95,0.05,0));sliders(o,c,["id_p"]);var r0=rnd(9),E=[];for(var i=0;i<80;i++)E.push(gauss(r0));
  o.draw=function(){var x=o.x,w=o.w,h=o.h,rho=+c.querySelector("#id_p").value,e=[E[0]];for(var i=1;i<E.length;i++)e.push(rho*e[i-1]+Math.sqrt(1-rho*rho)*E[i]);var L=30,T=20,W=w-L-20,H=h-T-30,X=function(i){return L+i/(E.length-1)*W},Y=function(v){return T+H/2-v/3.5*H/2};x.clearRect(0,0,w,h);
    x.strokeStyle="#c9cfdb";x.beginPath();x.moveTo(L,Y(0));x.lineTo(L+W,Y(0));x.stroke();e.forEach(function(v,i){x.strokeStyle=v>0?"rgba(0,166,224,.6)":"rgba(214,69,69,.6)";x.lineWidth=3;x.beginPath();x.moveTo(X(i),Y(0));x.lineTo(X(i),Y(v));x.stroke()});
    x.beginPath();e.forEach(function(v,i){i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v))});x.strokeStyle="#1f2430";x.lineWidth=1.2;x.stroke();
    var num=0,den=0;for(var i=0;i<e.length;i++){den+=e[i]*e[i];if(i)num+=Math.pow(e[i]-e[i-1],2)}var dw=num/den;val(c,"id_p",fmt(rho,2));
    o.out.innerHTML='<div class="kb-metricas"><span>Durbin-Watson = <b class="'+(dw<1.5?"kb-alerta":"kb-ok")+'">'+fmt(dw,2)+'</b></span></div><small>Cerca de 2: errores independientes (bien). Menor a 1.5: autocorrelación positiva; los intervalos de confianza serían falsamente estrechos. Solución: agregar lags o usar un modelo de series de tiempo.</small>'};o.draw()};

V["est-anova"]=function(el){var o=canvas(lab(el,"ANOVA: ¿las tiendas venden distinto o es azar?","Mueve el promedio de cada tienda y el ruido: ANOVA compara la variación entre tiendas contra la variación dentro de cada una (estadístico F)."));
  var c=controls(o,slider("an_a","Promedio tienda A",80,140,1,100)+slider("an_b","Promedio tienda B",80,140,1,108)+slider("an_c","Promedio tienda C",80,140,1,115)+slider("an_s","Variación dentro de cada tienda",3,30,1,12));sliders(o,c,["an_a","an_b","an_c","an_s"]);
  var r0=rnd(51),Z=[[],[],[]];for(var g=0;g<3;g++)for(var i=0;i<12;i++)Z[g].push(gauss(r0));
  o.draw=function(){var x=o.x,w=o.w,h=o.h,M=[+c.querySelector("#an_a").value,+c.querySelector("#an_b").value,+c.querySelector("#an_c").value],s=+c.querySelector("#an_s").value,col=["#00A6E0","#C13CFF","#13A86A"],L=40,T=16,W=w*.58-L,H=h-T-30,Y=function(v){return T+H-(v-40)/140*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var all=[],D=Z.map(function(z,g){return z.map(function(v){var q=M[g]+v*s;all.push(q);return q})}),gm=all.reduce(function(a,b){return a+b})/all.length,ssb=0,ssw=0;
    D.forEach(function(d,g){var m=d.reduce(function(a,b){return a+b})/d.length,cx=L+W*(g+.5)/3;ssb+=d.length*Math.pow(m-gm,2);d.forEach(function(v,i){ssw+=Math.pow(v-m,2);x.fillStyle=col[g];x.globalAlpha=.6;x.beginPath();x.arc(cx-20+(i%5)*10,Y(v),4,0,7);x.fill();x.globalAlpha=1});
      x.strokeStyle=col[g];x.lineWidth=3;x.beginPath();x.moveTo(cx-34,Y(m));x.lineTo(cx+34,Y(m));x.stroke();txt(x,"Tienda "+"ABC"[g],cx,T+H+14,DIM,"11px","center")});
    x.setLineDash([5,4]);x.strokeStyle="#1f2430";x.beginPath();x.moveTo(L,Y(gm));x.lineTo(L+W,Y(gm));x.stroke();x.setLineDash([]);
    var F=(ssb/2)/(ssw/33),sig=F>3.28;txt(x,"F = "+fmt(F,2),w*.64,h*.32,INK,"bold 28px");txt(x,sig?"Diferencia significativa (p < 0.05)":"No hay evidencia de diferencia",w*.64,h*.32+30,sig?"#0e7a4d":"#b53333","bold 13px");txt(x,"Valor crítico F(2, 33) ≈ 3.28",w*.64,h*.32+52,DIM,"12px");
    ["an_a","an_b","an_c","an_s"].forEach(function(id){val(c,id,c.querySelector("#"+id).value)});o.out.innerHTML="<small>Si el ruido dentro de cada tienda es grande, ni siquiera promedios distintos alcanzan para concluir que una tienda vende más.</small>"};o.draw()};

V["est-bayes"]=function(el){var o=canvas(lab(el,"Actualización bayesiana: creencia previa + datos","Ajusta lo que creías antes (previa) y los datos observados: la distribución posterior combina ambas cosas."));
  var c=controls(o,slider("by_p","Tasa de conversión que creías (%)",1,60,1,20)+slider("by_k","Confianza en esa creencia",2,100,1,10)+slider("by_n","Visitantes observados",0,500,10,100)+slider("by_x","Compraron (%)",0,60,1,35));sliders(o,c,["by_p","by_k","by_n","by_x"]);
  function lbeta(a,b){function lg(z){var g=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,.001208650973866179,-.000005395239384953],y=z,t=z+5.5;t-=(z+.5)*Math.log(t);var s=1.000000000190015;for(var j=0;j<6;j++)s+=g[j]/++y;return -t+Math.log(2.5066282746310005*s/z)}return lg(a)+lg(b)-lg(a+b)}
  function bp(q,a,b){return Math.exp((a-1)*Math.log(q)+(b-1)*Math.log(1-q)-lbeta(a,b))}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,p=+c.querySelector("#by_p").value/100,k=+c.querySelector("#by_k").value,n=+c.querySelector("#by_n").value,xs=Math.round(n*c.querySelector("#by_x").value/100),a0=p*k,b0=(1-p)*k,a1=a0+xs,b1=b0+n-xs,L=30,T=20,W=w-L-20,H=h-T-36,X=function(q){return L+q*W};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var cur=[[a0,b0,"#9aa3b5","previa"],[a1,b1,"#C13CFF","posterior"]],mx=0;cur.forEach(function(cv){for(var q=.002;q<.998;q+=.004)mx=Math.max(mx,bp(q,cv[0],cv[1]))});
    if(n>0){x.strokeStyle="#00A6E0";x.setLineDash([4,4]);x.beginPath();x.moveTo(X(xs/n),T);x.lineTo(X(xs/n),T+H);x.stroke();x.setLineDash([]);txt(x,"datos: "+fmt(xs/n*100,0)+"%",X(xs/n)+6,T+10,"#0077a8","11px")}
    cur.forEach(function(cv){x.beginPath();for(var q=.002;q<.998;q+=.004){var y=T+H-bp(q,cv[0],cv[1])/mx*H*.95;q<.004?x.moveTo(X(q),y):x.lineTo(X(q),y)}x.strokeStyle=cv[2];x.lineWidth=cv[3]==="posterior"?3:2;x.stroke()});
    for(var q=0;q<=1.001;q+=.2)txt(x,Math.round(q*100)+"%",X(q),T+H+14,DIM,"11px","center");
    ["by_p","by_k","by_n","by_x"].forEach(function(id){val(c,id,c.querySelector("#"+id).value+(id==="by_p"||id==="by_x"?"%":""))});
    o.out.innerHTML='<div class="kb-metricas"><span>Previa: <b>'+fmt(a0/(a0+b0)*100,1)+'%</b></span><span>Posterior: <b>'+fmt(a1/(a1+b1)*100,1)+'%</b></span></div><small>Con pocos datos manda la creencia previa; con muchos datos, mandan los datos. Gris: previa · morado: posterior · azul: lo observado.</small>'};o.draw()};

V["est-mle"]=function(el){var o=canvas(lab(el,"Máxima verosimilitud: el parámetro que mejor explica los datos","Mueve el promedio candidato: la curva de verosimilitud muestra qué tan probable sería observar estos datos; el máximo es la estimación MLE."));
  var c=controls(o,slider("ml_m","Promedio candidato μ",20,80,0.5,40));sliders(o,c,["ml_m"]);var Dt=[44,47,49,50,51,52,53,55,58,61];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,mu=+c.querySelector("#ml_m").value,s=5.5,L=40,T=16,W=w-L-20,Ht=(h-T-40)*.55,Hb=(h-T-40)*.4,X=function(v){return L+(v-20)/60*W};x.clearRect(0,0,w,h);
    x.beginPath();for(var v=20;v<=80;v+=.25){var y=T+Ht-pdf(v,mu,s)/pdf(0,0,s)*Ht*.9;v===20?x.moveTo(X(v),y):x.lineTo(X(v),y)}x.strokeStyle="#C13CFF";x.lineWidth=2.5;x.stroke();
    var ll=0;Dt.forEach(function(d){var py=T+Ht-pdf(d,mu,s)/pdf(0,0,s)*Ht*.9;x.strokeStyle="rgba(0,166,224,.6)";x.beginPath();x.moveTo(X(d),T+Ht);x.lineTo(X(d),py);x.stroke();x.fillStyle="#1f2430";x.beginPath();x.arc(X(d),T+Ht,4,0,7);x.fill();ll+=Math.log(pdf(d,mu,s))});
    var by=T+Ht+24,LL=function(m){var t=0;Dt.forEach(function(d){t+=Math.log(pdf(d,m,s))});return t},mn=LL(20),mxv=LL(52);x.beginPath();for(var m=20;m<=80;m+=.5){var y=by+Hb-(LL(m)-mn)/(mxv-mn)*Hb;m===20?x.moveTo(X(m),y):x.lineTo(X(m),y)}x.strokeStyle=grad(x,L,L+W);x.lineWidth=2.5;x.stroke();
    x.fillStyle="#C13CFF";x.beginPath();x.arc(X(mu),by+Hb-(ll-mn)/(mxv-mn)*Hb,6,0,7);x.fill();txt(x,"log-verosimilitud",L,by,DIM,"11px");vline(x,X(52),by,Hb,"#13A86A","máximo (μ = 52)",12);
    for(var v=20;v<=80;v+=10)txt(x,v,X(v),h-12,DIM,"11px","center");val(c,"ml_m",fmt(mu,1));
    o.out.innerHTML='<div class="kb-metricas"><span>log-verosimilitud = <b>'+fmt(ll,2)+'</b></span><span>Promedio de los datos = <b>52</b></span></div><small>Las barras azules son la probabilidad de cada dato con ese μ. MLE busca el μ que las hace más altas en conjunto; para una normal, coincide con el promedio.</small>'};o.draw()};

V["est-mcmc"]=function(el){var o=canvas(lab(el,"MCMC: una caminata que dibuja la distribución","Presiona reproducir: cada paso propone un valor nuevo y lo acepta según su probabilidad. Con suficientes pasos el histograma se parece a la distribución real."));
  var c=controls(o,slider("mm_s","Tamaño del paso",0.05,3,0.05,0.8)+'<button type="button" class="kb-btn kb-btn-pri" id="mm_go">▶ 1,000 pasos</button><button type="button" class="kb-btn" id="mm_rst">Reiniciar</button>');
  var r0=rnd(61),ch=[0],acc=0,tm=null;function target(v){return .6*pdf(v,-1,.7)+.4*pdf(v,1.8,.6)}
  function step(k){var s=+c.querySelector("#mm_s").value;for(var i=0;i<k;i++){var cur=ch[ch.length-1],pr=cur+gauss(r0)*s;if(r0()<target(pr)/target(cur)){ch.push(pr);acc++}else ch.push(cur)}}
  c.querySelector("#mm_go").onclick=function(){clearInterval(tm);var n=0;tm=setInterval(function(){step(50);n+=50;o.draw();if(n>=1000)clearInterval(tm)},40)};c.querySelector("#mm_rst").onclick=function(){clearInterval(tm);ch=[0];acc=0;o.draw()};c.querySelector("#mm_s").oninput=function(){val(c,"mm_s",c.querySelector("#mm_s").value)};step(300);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,L=30,W=w*.48-L,T=20,H=h-T-30,lo=-4,hi=4;x.clearRect(0,0,w,h);var n=ch.length,show=ch.slice(-300);
    x.beginPath();show.forEach(function(v,i){var px=L+i/299*W,py=T+H-(v-lo)/(hi-lo)*H;i?x.lineTo(px,py):x.moveTo(px,py)});x.strokeStyle="#9B3FD9";x.lineWidth=1.2;x.stroke();txt(x,"cadena (últimos 300 pasos)",L,10,DIM,"11px");
    var gx=w*.55,GW=w-gx-16,B=40,cnt=new Array(B).fill(0);ch.forEach(function(v){var b=Math.floor((v-lo)/(hi-lo)*B);if(b>=0&&b<B)cnt[b]++});var mx=Math.max.apply(null,cnt)||1;bars(x,cnt,gx,GW,T,H,mx,function(){return"rgba(0,166,224,.7)"});
    var tm2=0;for(var v=lo;v<=hi;v+=.05)tm2=Math.max(tm2,target(v));x.beginPath();for(var v=lo;v<=hi;v+=.05){var y=T+H-target(v)/tm2*H*.95;v===lo?x.moveTo(gx+(v-lo)/(hi-lo)*GW,y):x.lineTo(gx+(v-lo)/(hi-lo)*GW,y)}x.strokeStyle="#1f2430";x.lineWidth=2;x.stroke();txt(x,"histograma vs. distribución real",gx,10,DIM,"11px");
    val(c,"mm_s",c.querySelector("#mm_s").value);o.out.innerHTML='<div class="kb-metricas"><span>Pasos: <b>'+fmt(n-1)+'</b></span><span>Aceptación: <b>'+fmt(n>1?acc/(n-1)*100:0,0)+'%</b></span></div><small>Paso muy pequeño: casi todo se acepta pero avanza lento. Paso muy grande: casi todo se rechaza. Lo ideal suele estar entre 20% y 50% de aceptación.</small>'};o.draw()};

V["est-mixto"]=function(el){var o=canvas(lab(el,"Modelo mixto: tiendas con pocos datos se acercan al promedio general","Mueve cuánto se comparte la información entre tiendas: las tiendas con pocas semanas de datos se jalan hacia la media global (shrinkage)."));
  var c=controls(o,slider("mx_k","Fuerza del efecto compartido",0,40,1,10));sliders(o,c,["mx_k"]);var S=[["Centro",160,52],["Norte",210,4],["Sur",120,40],["Golfo",230,3],["Bajío",145,26],["Pacífico",95,2]],gm=150;
  o.draw=function(){var x=o.x,w=o.w,h=o.h,k=+c.querySelector("#mx_k").value,L=90,W=w-L-130,X=function(v){return L+(v-60)/200*W},rh=(h-40)/S.length;x.clearRect(0,0,w,h);
    x.setLineDash([5,4]);x.strokeStyle="#1f2430";x.beginPath();x.moveTo(X(gm),10);x.lineTo(X(gm),h-24);x.stroke();x.setLineDash([]);txt(x,"media global",X(gm)+6,14,INK,"11px");
    S.forEach(function(s,i){var wgt=s[2]/(s[2]+k),est=gm+wgt*(s[1]-gm),y=30+i*rh;txt(x,s[0],L-10,y,INK,"12px","right");txt(x,s[2]+" sem",L-10,y+14,DIM,"10px","right");
      x.strokeStyle="#c9cfdb";x.lineWidth=2;x.beginPath();x.moveTo(X(s[1]),y);x.lineTo(X(est),y);x.stroke();x.fillStyle="#9aa3b5";x.beginPath();x.arc(X(s[1]),y,5,0,7);x.fill();x.fillStyle="#C13CFF";x.beginPath();x.arc(X(est),y,7,0,7);x.fill();txt(x,fmt(est,0),L+W+14,y,"#9B3FD9","bold 12px")});
    val(c,"mx_k",k);o.out.innerHTML="<small>Gris: promedio propio de cada tienda. Morado: estimación del modelo mixto. Golfo y Pacífico tienen 2–4 semanas de datos, así que el modelo no confía tanto en su promedio; Centro, con 52 semanas, casi no se mueve.</small>"};o.draw()};

/* ---- MATEMÁTICAS ---- */
V["mat-riemann"]=function(el){var o=canvas(lab(el,"La integral es un área: rectángulos que se afinan","Aumenta el número de rectángulos: la suma se acerca al área exacta bajo la curva. Así se calcula, por ejemplo, la probabilidad acumulada."));
  var c=controls(o,slider("ri_n","Número de rectángulos",2,120,1,6)+slider("ri_b","Hasta x =",1,6,0.1,4));sliders(o,c,["ri_n","ri_b"]);
  function f(v){return 1.2+Math.sin(v)*0.8+v*0.25}function F(v){return 1.2*v-Math.cos(v)*0.8+0.8+0.125*v*v}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,n=+c.querySelector("#ri_n").value,b=+c.querySelector("#ri_b").value,L=40,T=16,W=w-L-20,H=h-T-34,X=function(v){return L+v/6.2*W},Y=function(v){return T+H-v/3.6*H},dx=b/n,s=0;x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    for(var i=0;i<n;i++){var xm=(i+.5)*dx,y=f(xm);s+=y*dx;x.fillStyle=i%2?"rgba(0,166,224,.35)":"rgba(193,60,255,.3)";x.fillRect(X(i*dx),Y(y),X(dx)-X(0),T+H-Y(y))}
    x.beginPath();for(var v=0;v<=6.2;v+=.02)v?x.lineTo(X(v),Y(f(v))):x.moveTo(X(v),Y(f(v)));x.strokeStyle="#1f2430";x.lineWidth=2.5;x.stroke();for(var v=0;v<=6;v++)txt(x,v,X(v),T+H+14,DIM,"11px","center");
    var ex=F(b)-F(0);val(c,"ri_n",n);val(c,"ri_b",fmt(b,1));o.out.innerHTML='<div class="kb-metricas"><span>Suma de rectángulos = <b>'+fmt(s,4)+'</b></span><span>Área exacta = <b>'+fmt(ex,4)+'</b></span><span>Error = <b>'+fmt(Math.abs(s-ex),4)+'</b></span></div><small>Con más rectángulos (dx más pequeño) el error tiende a cero: esa es la idea de la integral.</small>'};o.draw()};

V["mat-newton"]=function(el){var o=canvas(lab(el,"Método de Newton: llegar a la raíz paso a paso","Elige el punto de inicio y avanza: cada iteración sigue la tangente hasta el eje x. Así resuelven las computadoras ecuaciones sin fórmula cerrada."));
  var c=controls(o,slider("nw_x","Punto de inicio x₀",-1,4,0.1,3.5)+slider("nw_k","Iteraciones",0,6,1,1));sliders(o,c,["nw_x","nw_k"]);
  function f(v){return v*v*v-2*v-5}function d(v){return 3*v*v-2}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,x0=+c.querySelector("#nw_x").value,k=+c.querySelector("#nw_k").value,L=40,T=16,W=w-L-20,H=h-T-30,lo=-1.5,hi=4.2,X=function(v){return L+(v-lo)/(hi-lo)*W},Y=function(v){return T+H/2-v/45*H/2};x.clearRect(0,0,w,h);
    x.strokeStyle="#c9cfdb";x.beginPath();x.moveTo(L,Y(0));x.lineTo(L+W,Y(0));x.stroke();x.beginPath();for(var v=lo;v<=hi;v+=.02){var y=Y(clamp(f(v),-45,45));v===lo?x.moveTo(X(v),y):x.lineTo(X(v),y)}x.strokeStyle=grad(x,L,L+W);x.lineWidth=3;x.stroke();
    var cur=x0,pts=[cur];for(var i=0;i<k;i++){var nx=cur-f(cur)/d(cur);x.strokeStyle="rgba(242,170,20,.9)";x.lineWidth=1.5;x.beginPath();x.moveTo(X(cur),Y(clamp(f(cur),-45,45)));x.lineTo(X(clamp(nx,lo,hi)),Y(0));x.stroke();x.setLineDash([3,3]);x.beginPath();x.moveTo(X(clamp(nx,lo,hi)),Y(0));x.lineTo(X(clamp(nx,lo,hi)),Y(clamp(f(nx),-45,45)));x.stroke();x.setLineDash([]);cur=nx;pts.push(cur)}
    pts.forEach(function(p,i){x.fillStyle=i===pts.length-1?"#C13CFF":"#1f2430";x.beginPath();x.arc(X(clamp(p,lo,hi)),Y(0),5,0,7);x.fill()});val(c,"nw_x",fmt(x0,1));val(c,"nw_k",k);
    o.out.innerHTML='<div class="kb-metricas"><span>x = <b>'+fmt(cur,6)+'</b></span><span>f(x) = <b>'+fmt(f(cur),6)+'</b></span></div><small>Ecuación: x³ − 2x − 5 = 0 (raíz ≈ 2.094551). Cerca de la raíz, cada iteración duplica los dígitos correctos.</small>'};o.draw()};

/* ---- INTELIGENCIA ARTIFICIAL ---- */
V["ia-epocas"]=function(el){var o=canvas(lab(el,"Curvas de aprendizaje y early stopping","Avanza las épocas de entrenamiento: el error de entrenamiento siempre baja, pero el de validación vuelve a subir cuando el modelo empieza a memorizar."));
  var c=controls(o,slider("ep_e","Épocas entrenadas",1,100,1,30)+slider("ep_c","Complejidad del modelo",1,10,1,6));sliders(o,c,["ep_e","ep_c"]);
  function tr(e,cx){return .1+.9*Math.exp(-e/(12-cx))}function va(e,cx){return .18+.82*Math.exp(-e/(12-cx))+Math.max(0,(e-35+cx*2))*.004*cx}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,E=+c.querySelector("#ep_e").value,cx=+c.querySelector("#ep_c").value,L=40,T=16,W=w-L-20,H=h-T-30,X=function(e){return L+(e-1)/99*W},Y=function(v){return T+H-v/1.1*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var best=1,bv=9;for(var e=1;e<=100;e++){if(va(e,cx)<bv){bv=va(e,cx);best=e}}
    [["entrenamiento",tr,"#00A6E0"],["validación",va,"#C13CFF"]].forEach(function(q){x.beginPath();for(var e=1;e<=E;e++)e===1?x.moveTo(X(e),Y(q[1](e,cx))):x.lineTo(X(e),Y(q[1](e,cx)));x.strokeStyle=q[2];x.lineWidth=3;x.stroke()});
    vline(x,X(best),T,H,"#13A86A","mejor época: "+best,12);txt(x,"error",L-34,T+6,DIM,"11px");txt(x,"épocas",L+W,T+H+14,DIM,"11px","right");
    [["entrenamiento","#00A6E0"],["validación","#C13CFF"]].forEach(function(l,i){x.fillStyle=l[1];x.fillRect(L+W-220+i*110,T+4,14,3);txt(x,l[0],L+W-200+i*110,T+6,DIM,"11px")});
    val(c,"ep_e",E);val(c,"ep_c",cx);o.out.innerHTML="<small>"+(E>best+5?'<span class="kb-alerta">Sobreajuste:</span> después de la época '+best+' el modelo memoriza y empeora con datos nuevos. Early stopping detiene el entrenamiento ahí.':"Todavía aprendiendo: ambos errores bajan.")+"</small>"};o.draw()};

V["ia-embed"]=function(el){var o=canvas(lab(el,"Embeddings: palabras como puntos en un espacio","Haz clic en una palabra: el sistema encuentra las más cercanas por similitud coseno, igual que un buscador semántico o un RAG."));
  controls(o,"");var Wd=[["crédito",.72,.30],["préstamo",.76,.36],["tarjeta",.66,.22],["deuda",.80,.42],["hipoteca",.70,.44],["inventario",.22,.70],["almacén",.18,.78],["pedido",.30,.62],["proveedor",.26,.56],["CEDIS",.14,.66],["modelo",.48,.12],["red neuronal",.56,.08],["algoritmo",.42,.16],["datos",.50,.22]],sel=0;
  o.c.style.cursor="pointer";o.c.addEventListener("click",function(e){var b=o.c.getBoundingClientRect(),px=(e.clientX-b.left)/(o.sc||1),py=(e.clientY-b.top)/(o.sc||1),best=0,bd=1e9;Wd.forEach(function(q,i){var d=Math.hypot(px-(30+q[1]*(o.w*.6)),py-(16+q[2]*(o.h-40)));if(d<bd){bd=d;best=i}});sel=best;o.draw()});
  o.draw=function(){var x=o.x,w=o.w,h=o.h,PX=function(q){return 30+q[1]*(w*.6)},PY=function(q){return 16+q[2]*(h-40)},s=Wd[sel],cx=.45,cy=.42;x.clearRect(0,0,w,h);
    var sim=Wd.map(function(q,i){var a=[s[1]-cx,s[2]-cy],b=[q[1]-cx,q[2]-cy];return[i,(a[0]*b[0]+a[1]*b[1])/(Math.hypot(a[0],a[1])*Math.hypot(b[0],b[1]))]}).filter(function(q){return q[0]!==sel}).sort(function(a,b){return b[1]-a[1]});
    sim.slice(0,3).forEach(function(q){var t=Wd[q[0]];x.strokeStyle="rgba(193,60,255,.5)";x.lineWidth=2;x.beginPath();x.moveTo(PX(s),PY(s));x.lineTo(PX(t),PY(t));x.stroke()});
    Wd.forEach(function(q,i){var top=sim.slice(0,3).some(function(z){return z[0]===i});x.fillStyle=i===sel?"#C13CFF":top?"#00A6E0":"#9aa3b5";x.beginPath();x.arc(PX(q),PY(q),i===sel?8:6,0,7);x.fill();txt(x,q[0],PX(q)+10,PY(q),i===sel||top?INK:DIM,i===sel?"bold 12px":"11px")});
    var gx=w*.68;txt(x,"Más parecidas a “"+s[0]+"”",gx,30,INK,"bold 13px");sim.slice(0,3).forEach(function(q,i){txt(x,(i+1)+". "+Wd[q[0]][0],gx,62+i*26,INK,"13px");txt(x,"cos = "+fmt(q[1],2),gx+130,62+i*26,"#9B3FD9","12px")});
    o.out.innerHTML="<small>Vectores ilustrativos en 2 dimensiones; los modelos reales usan cientos o miles. Un RAG convierte tu pregunta en un vector y recupera los documentos más cercanos.</small>"};o.draw()};

V["ia-softmax"]=function(el){var o=canvas(lab(el,"Temperatura: qué tan creativo es un modelo generativo","Mueve la temperatura: baja = siempre elige la palabra más probable; alta = reparte la probabilidad y el texto se vuelve más variado (y arriesgado)."));
  var c=controls(o,slider("sm_t","Temperatura",0.1,2.5,0.05,1));sliders(o,c,["sm_t"]);var Wd=["ventas","demanda","clientes","inventario","precio","clima"],Lg=[3.2,2.6,1.8,1.4,.6,-.4];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,t=+c.querySelector("#sm_t").value,ex=Lg.map(function(l){return Math.exp(l/t)}),s=ex.reduce(function(a,b){return a+b}),P=ex.map(function(e){return e/s}),L=110,W=w-L-80,rh=(h-50)/Wd.length;x.clearRect(0,0,w,h);
    txt(x,"“El modelo pronostica la …”  siguiente palabra:",14,16,INK,"bold 12px");P.forEach(function(p,i){var y=36+i*rh;txt(x,Wd[i],L-10,y+rh*.35,INK,"12px","right");x.fillStyle="#eef1f6";rr(x,L,y,W,rh*.7,5);x.fill();x.fillStyle=i===0?"#C13CFF":"#00A6E0";rr(x,L,y,Math.max(2,p*W),rh*.7,5);x.fill();txt(x,fmt(p*100,1)+"%",L+p*W+8,y+rh*.35,DIM,"11px")});
    val(c,"sm_t",fmt(t,2));o.out.innerHTML="<small>"+(t<.5?"Temperatura baja: respuestas consistentes y predecibles, ideal para extraer datos o clasificar.":t>1.5?"Temperatura alta: más variedad, pero aumentan las respuestas raras o inventadas.":"Temperatura media: equilibrio entre precisión y variedad.")+" Softmax con temperatura: pᵢ = e^(zᵢ/T) / Σ e^(zⱼ/T).</small>"};o.draw()};

/* ---- BASES DE DATOS ---- */
V["bd-ventana"]=function(el){var o=canvas(lab(el,"Funciones de ventana: AVG() OVER (ROWS BETWEEN …)","Mueve el tamaño de la ventana: para cada fila se promedian las anteriores sin perder el detalle diario."));
  var c=controls(o,slider("wv_n","Filas anteriores (PRECEDING)",0,6,1,2)+slider("wv_r","Fila actual",0,13,1,8));sliders(o,c,["wv_n","wv_r"]);var V0=[1520,1610,1480,1700,1930,2100,1650,1580,1720,1690,1810,2050,2240,1760];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,n=+c.querySelector("#wv_n").value,r=+c.querySelector("#wv_r").value,rh=(h-34)/V0.length,cw=[90,90,110];x.clearRect(0,0,w,h);
    ["día","ventas","media_móvil"].forEach(function(hd,i){txt(x,hd,20+cw.slice(0,i).reduce(function(a,b){return a+b},0),12,DIM,"bold 11px")});
    V0.forEach(function(v,i){var y=26+i*rh,inw=i>=r-n&&i<=r,ma=0,k=0;for(var j=Math.max(0,i-n);j<=i;j++){ma+=V0[j];k++}ma/=k;x.fillStyle=i===r?"rgba(193,60,255,.18)":inw?"rgba(242,232,20,.25)":(i%2?"#f8f9fc":"#fff");x.fillRect(14,y,300,rh-2);
      txt(x,"día "+(i+1),20,y+rh/2,INK,"11px");txt(x,"$"+fmt(v),110,y+rh/2,INK,"11px");txt(x,"$"+fmt(ma),200,y+rh/2,i===r?"#9B3FD9":DIM,i===r?"bold 11px":"11px")});
    var gx=340,GW=w-gx-20,GH=h-60,mx=2400,X=function(i){return gx+i/(V0.length-1)*GW},Y=function(v){return 30+GH-(v-1200)/(mx-1200)*GH};
    x.fillStyle="rgba(242,232,20,.25)";x.fillRect(X(Math.max(0,r-n))-4,30,X(r)-X(Math.max(0,r-n))+8,GH);x.beginPath();V0.forEach(function(v,i){i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v))});x.strokeStyle="rgba(0,166,224,.7)";x.lineWidth=1.8;x.stroke();
    x.beginPath();V0.forEach(function(v,i){var ma=0,k=0;for(var j=Math.max(0,i-n);j<=i;j++){ma+=V0[j];k++}ma/=k;i?x.lineTo(X(i),Y(ma)):x.moveTo(X(i),Y(ma))});x.strokeStyle="#13A86A";x.lineWidth=3;x.stroke();
    val(c,"wv_n",n);val(c,"wv_r","día "+(r+1));o.out.innerHTML="<small>AVG(ventas) OVER (ORDER BY fecha ROWS BETWEEN "+n+" PRECEDING AND CURRENT ROW): a diferencia de GROUP BY, se conservan las "+V0.length+" filas.</small>"};o.draw()};

V["bd-normal"]=function(el){var o=lab(el,"Normalización: tabla repetida vs. tablas relacionadas","Cambia entre las dos versiones: en la tabla desnormalizada el nombre y la ciudad se repiten; si el cliente se muda hay que corregir muchas filas.");
  var box=document.createElement("div");box.style.cssText="padding:14px 16px;overflow-x:auto";el.appendChild(box);var c=controls(o,seg("nr",["Desnormalizada","Normalizada (3FN)"],"Desnormalizada"));
  var P=[[101,1,"Ana","CDMX",820],[102,3,"Sofía","MTY",1240],[103,1,"Ana","CDMX",460],[104,2,"Luis","GDL",990],[105,1,"Ana","CDMX",310]];
  function tbl(hd,rows,mark){return '<table style="width:auto;margin:0 14px 10px 0;display:inline-table;vertical-align:top;font-size:.82rem"><thead><tr>'+hd.map(function(x){return"<th>"+x+"</th>"}).join("")+"</tr></thead><tbody>"+rows.map(function(r){return"<tr>"+r.map(function(v,i){return"<td"+(mark&&mark(r,i)?' style="background:#fdecec !important;color:#b53333;font-weight:600"':"")+">"+v+"</td>"}).join("")+"</tr>"}).join("")+"</tbody></table>"}
  function set(m){if(m==="Desnormalizada"){box.innerHTML=tbl(["pedido","id_cliente","nombre","ciudad","total"],P,function(r,i){return r[1]===1&&(i===2||i===3)});o.out.innerHTML='<small><span class="kb-alerta">Ana y CDMX se repiten 3 veces.</span> Si Ana se muda, hay que cambiar 3 filas y si se te olvida una, los datos quedan inconsistentes.</small>'}
    else{box.innerHTML=tbl(["id_cliente","nombre","ciudad"],[[1,"Ana","CDMX"],[2,"Luis","GDL"],[3,"Sofía","MTY"]])+tbl(["pedido","id_cliente","total"],P.map(function(p){return[p[0],p[1],"$"+fmt(p[4])]}));o.out.innerHTML='<small><span class="kb-ok">Cada dato vive en un solo lugar.</span> Si Ana se muda, se cambia una fila en clientes y todos sus pedidos quedan bien gracias a la llave foránea id_cliente.</small>'}}
  onSeg(c,"nr",set);set("Desnormalizada")};

/* ---- SISTEMAS OPERATIVOS ---- */
V["so-cron"]=function(el){var o=canvas(lab(el,"Tareas programadas con cron","Arma la expresión cron con los controles: verás la línea que pondrías en crontab y las próximas ejecuciones en el calendario."));
  var c=controls(o,slider("cr_m","Minuto",0,59,1,0)+slider("cr_h","Hora",0,23,1,6)+seg("cd",["Todos los días","Lunes a viernes","Solo lunes"],"Lunes a viernes"));var dm="Lunes a viernes";sliders(o,c,["cr_m","cr_h"]);onSeg(c,"cd",function(v){dm=v;o.draw()});
  o.draw=function(){var x=o.x,w=o.w,h=o.h,m=+c.querySelector("#cr_m").value,hr=+c.querySelector("#cr_h").value,dw=dm==="Todos los días"?"*":dm==="Lunes a viernes"?"1-5":"1",D=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],on=function(i){return dm==="Todos los días"||(dm==="Lunes a viernes"&&i<5)||(dm==="Solo lunes"&&i===0)};x.clearRect(0,0,w,h);
    x.fillStyle="#0c0e14";rr(x,14,14,w-28,48,10);x.fill();x.font="15px Consolas,monospace";x.fillStyle="#19E36B";x.textAlign="left";x.textBaseline="middle";x.fillText(m+" "+hr+" * * "+dw+"   python reentrenar_modelo.py",30,38);
    var cw=(w-28)/7,top=80,ch=h-top-14;D.forEach(function(d,i){var cx=14+i*cw;x.fillStyle=on(i)?"rgba(193,60,255,.12)":"#f6f7fb";rr(x,cx+3,top,cw-6,ch,10);x.fill();txt(x,d,cx+cw/2,top+16,INK,"bold 12px","center");
      var y=top+28+hr/24*(ch-40);x.strokeStyle="#e6e9f2";x.beginPath();x.moveTo(cx+10,top+28);x.lineTo(cx+10,top+ch-12);x.stroke();if(on(i)){x.fillStyle="#C13CFF";x.beginPath();x.arc(cx+cw/2,y,8,0,7);x.fill();txt(x,String(hr).padStart(2,"0")+":"+String(m).padStart(2,"0"),cx+cw/2,y+18,"#9B3FD9","bold 11px","center")}});
    val(c,"cr_m",m);val(c,"cr_h",hr);o.out.innerHTML="<small>Formato: minuto · hora · día del mes · mes · día de la semana. En Windows lo equivalente es el Programador de tareas.</small>"};o.draw()};

/* ---- STORYTELLING ---- */
V["st-pastel"]=function(el){var o=canvas(lab(el,"Pastel vs. barras: ¿cuál región es más grande?","Elige tu respuesta mirando solo el pastel y después revisa las barras: el ojo compara mucho mejor longitudes que ángulos."));
  var c=controls(o,seg("pq",["Centro","Sur","Golfo"],"")+'<button type="button" class="kb-btn kb-btn-pri" id="pq_show">Mostrar barras</button>');var show=false,ans=null;onSeg(c,"pq",function(v){ans=v;o.draw()});c.querySelector("#pq_show").onclick=function(){show=true;o.draw()};
  var nm=["Centro","Sur","Golfo","Norte","Bajío","Pacífico","Sureste","Occidente"],v=[15.2,15.8,15.5,12,11,10.5,10.2,9.8],col=["#00A6E0","#C13CFF","#13A86A","#F2A814","#e53935","#3949ab","#8e24aa","#00897b"];
  o.draw=function(){var x=o.x,w=o.w,h=o.h,cx=w*.25,cy=h/2,R=Math.min(h*.42,w*.2),a=-Math.PI/2,tot=v.reduce(function(s,q){return s+q});x.clearRect(0,0,w,h);
    v.forEach(function(q,i){var b=a+q/tot*Math.PI*2;x.fillStyle=col[i];x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R,a,b);x.closePath();x.fill();x.strokeStyle="#fff";x.lineWidth=2;x.stroke();var m=(a+b)/2;if(i<3)txt(x,nm[i],cx+Math.cos(m)*R*.66,cy+Math.sin(m)*R*.66,"#fff","bold 11px","center");a=b});
    if(show){var L=w*.58,W=w-L-60,rh=(h-20)/nm.length,ord=v.map(function(q,i){return[q,i]}).sort(function(a,b){return b[0]-a[0]});ord.forEach(function(q,j){var y=10+j*rh;txt(x,nm[q[1]],L-8,y+rh*.4,INK,"11px","right");x.fillStyle=col[q[1]];rr(x,L,y,q[0]/16*W,rh*.75,3);x.fill();txt(x,q[0]+"%",L+q[0]/16*W+6,y+rh*.4,DIM,"11px")})}
    else{txt(x,"¿Centro, Sur o Golfo? Elige abajo y luego muestra las barras",w*.55,h/2,DIM,"13px");if(ans)txt(x,"Tu respuesta: "+ans,w*.55,h/2+28,"#9B3FD9","bold 15px")}
    o.out.innerHTML=show?"<small>"+(ans==="Sur"?'<span class="kb-ok">¡Correcto!</span> ':ans?'<span class="kb-alerta">Era Sur.</span> ':"")+"Sur 15.8%, Golfo 15.5%, Centro 15.2%: casi imposible de ver en el pastel, inmediato en barras ordenadas.</small>":"<small>"+(ans?"Elegiste <b>"+ans+"</b>. Ahora presiona “Mostrar barras” para comprobarlo. ":"")+"Las tres rebanadas difieren por menos de un punto porcentual.</small>"};o.draw()};

V["st-audiencia"]=function(el){var o=lab(el,"El mismo hallazgo para cada audiencia","Elige a quién le presentas: cambia el título, el nivel de detalle y la gráfica recomendada.");
  var card=document.createElement("div");card.style.cssText="margin:14px 16px;padding:18px 20px;border-radius:12px;background:#f6f7fb;border-left:4px solid #C13CFF;transition:opacity .3s";el.appendChild(card);
  var A={"Dirección":["Reducir inventario 8% libera 12 mdp sin riesgo de desabasto","1 KPI grande + 1 recomendación","Número grande con comparación vs. meta","¿Aprobamos la reducción este trimestre?"],"Gerencia":["5 sucursales concentran el 60% de los faltantes","Ranking por sucursal y responsable","Barras horizontales ordenadas con semáforo","¿Quién atiende cada sucursal y cuándo?"],"Equipo técnico":["XGBoost: MAE 6.4 en validación temporal de 60 días","Métricas, supuestos, validación y código","Residuales e importancia de variables","¿Qué variables agregamos en la siguiente versión?"],"Público general":["¿Cómo sabe una farmacia cuántas medicinas pedir? Así decide un modelo","Una sola idea con un ejemplo cotidiano","Animación que revela los datos paso a paso","¿Te imaginabas que tu compra ayuda a pronosticar?"]};
  var c=controls(o,seg("au",Object.keys(A),"Dirección"));
  function set(k){var a=A[k];card.style.opacity=0;setTimeout(function(){card.innerHTML='<div style="font-size:.72rem;letter-spacing:.1em;font-weight:700;color:#6b7280;text-transform:uppercase">Título que dice la conclusión</div><div style="font-size:1.25rem;font-weight:700;color:#1f2430;margin:4px 0 12px">“'+a[0]+'”</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;font-size:.88rem"><div><b>Detalle:</b><br>'+a[1]+'</div><div><b>Gráfica:</b><br>'+a[2]+'</div><div><b>Cierre:</b><br>'+a[3]+'</div></div>';card.style.opacity=1},150);o.out.innerHTML="<small>El dato es el mismo (pronóstico de inventario); lo que cambia es qué decisión va a tomar quien escucha.</small>"}
  onSeg(c,"au",set);set("Dirección")};

/* ---- AZURE ---- */
V["az-costo"]=function(el){var o=canvas(lab(el,"¿Cuánto cuesta una máquina virtual al mes?","Elige el tamaño, cuántas horas está encendida y el almacenamiento: apagar la VM fuera de horario puede ahorrar más de la mitad. Precios ilustrativos."));
  var Sz={"Pequeña (2 vCPU)":0.10,"Mediana (4 vCPU)":0.20,"Grande (8 vCPU)":0.40,"GPU para IA":3.00},sz="Mediana (4 vCPU)";
  var c=controls(o,seg("vm",Object.keys(Sz),sz)+slider("vm_h","Horas encendida por día",1,24,1,12)+slider("vm_d","Almacenamiento (GB)",32,2000,32,256));onSeg(c,"vm",function(v){sz=v;o.draw()});sliders(o,c,["vm_h","vm_d"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,hr=+c.querySelector("#vm_h").value,gb=+c.querySelector("#vm_d").value,comp=Sz[sz]*hr*30,sto=gb*0.05,tot=comp+sto,full=Sz[sz]*24*30+sto,L=170,W=w-L-110,mx=Math.max(full,1);x.clearRect(0,0,w,h);
    [["Cómputo ("+hr+" h/día)",comp,"#00A6E0"],["Almacenamiento ("+gb+" GB)",sto,"#C13CFF"],["Total al mes",tot,"#1f2430"],["Si estuviera 24/7",full,"#c4c9d4"]].forEach(function(r,i){var y=22+i*((h-30)/4),bw=Math.max(3,r[1]/mx*W);txt(x,r[0],L-10,y+14,INK,"12px","right");x.fillStyle=r[2];rr(x,L,y,bw,28,6);x.fill();txt(x,"$"+fmt(r[1],0)+" USD",L+bw+8,y+14,INK,"bold 12px")});
    val(c,"vm_h",hr);val(c,"vm_d",gb);o.out.innerHTML='<div class="kb-metricas"><span>Ahorro vs. 24/7: <b class="kb-ok">'+fmt((1-tot/full)*100,0)+'%</b></span></div><small>Valores ilustrativos para comparar escenarios; los precios reales dependen de la región y el tipo de máquina. Usa la calculadora oficial antes de presupuestar.</small>'};o.draw()};

V["az-subred"]=function(el){var o=canvas(lab(el,"Subredes: ¿cuántas IP caben con cada prefijo?","Mueve el prefijo CIDR: cada bit menos divide el espacio a la mitad. Azure reserva 5 direcciones en cada subred."));
  var c=controls(o,slider("sb_p","Prefijo de la subred /",16,29,1,24));sliders(o,c,["sb_p"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,p=+c.querySelector("#sb_p").value,tot=Math.pow(2,32-p),use=Math.max(0,tot-5),cells=Math.min(256,tot),cols=32,cs=Math.min(14,(w*.55)/cols);x.clearRect(0,0,w,h);
    for(var i=0;i<256;i++){var cx=16+(i%cols)*cs,cy=20+Math.floor(i/cols)*cs;x.fillStyle=i<cells?(i<5&&tot<=256?"#D64545":"#00A6E0"):"#eef1f6";rr(x,cx,cy,cs-2,cs-2,2);x.fill()}
    txt(x,tot>256?"cada cuadro = "+fmt(tot/256)+" direcciones":"cada cuadro = 1 dirección (rojo: reservadas)",16,20+8*cs+14,DIM,"11px");
    var gx=w*.62;txt(x,"10.0.1.0/"+p,gx,h*.25,INK,"bold 24px");txt(x,"Direcciones totales: "+fmt(tot),gx,h*.25+34,INK,"13px");txt(x,"Utilizables en Azure: "+fmt(use),gx,h*.25+56,"#0e7a4d","bold 13px");txt(x,"Subredes /"+p+" en una VNet /16: "+fmt(Math.pow(2,p-16)),gx,h*.25+78,DIM,"12px");
    val(c,"sb_p",p);o.out.innerHTML="<small>Las 5 reservadas: la de red, la de broadcast y 3 que usa Azure (puerta de enlace y DNS). Una /29 deja solo 3 IP utilizables: elige el tamaño pensando en el crecimiento.</small>"};o.draw()};

/* ---- INGENIERÍA DE VARIABLES ---- */
V["iv-tend"]=function(el){var o=canvas(lab(el,"Crecimiento de dos puntos vs. pendiente de tendencia","Sube el ruido del saldo mensual: comparar solo el mes actual contra hace 3 meses engaña; la pendiente de una regresión sobre 6 meses es más estable."));
  var c=controls(o,slider("tn_r","Ruido mensual",0,30,1,12)+slider("tn_s","Tendencia real (miles $/mes)",-5,5,0.5,2)+'<button type="button" class="kb-btn" id="tn_new">Otro cliente</button>');sliders(o,c,["tn_r","tn_s"]);var seed=5;c.querySelector("#tn_new").onclick=function(){seed+=7;o.draw()};
  o.draw=function(){var x=o.x,w=o.w,h=o.h,nz=+c.querySelector("#tn_r").value,sl=+c.querySelector("#tn_s").value,r0=rnd(seed),Y=[];for(var i=0;i<6;i++)Y.push(50+sl*i+gauss(r0)*nz/3);var L=40,T=20,W=w*.58-L,H=h-T-30,X=function(i){return L+i/5*W},Yp=function(v){return T+H-(v-10)/90*H};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    var mx=2.5,my=Y.reduce(function(a,b){return a+b})/6,sxy=0,sxx=0;Y.forEach(function(v,i){sxy+=(i-mx)*(v-my);sxx+=(i-mx)*(i-mx)});var b1=sxy/sxx,b0=my-b1*mx,g=(Y[5]-Y[2])/Y[2];
    x.strokeStyle=grad(x,L,L+W);x.lineWidth=3;x.beginPath();x.moveTo(X(0),Yp(b0));x.lineTo(X(5),Yp(b0+b1*5));x.stroke();x.strokeStyle="#F2A814";x.setLineDash([5,4]);x.lineWidth=2;x.beginPath();x.moveTo(X(2),Yp(Y[2]));x.lineTo(X(5),Yp(Y[5]));x.stroke();x.setLineDash([]);
    Y.forEach(function(v,i){x.fillStyle="#1f2430";x.beginPath();x.arc(X(i),Yp(v),5,0,7);x.fill();txt(x,"m"+(i-5||"")+(i===5?" (hoy)":""),X(i),T+H+14,DIM,"10px","center")});
    var gx=w*.64;txt(x,"Crecimiento vs. hace 3 meses",gx,h*.25,DIM,"12px");txt(x,(g>=0?"+":"")+fmt(g*100,1)+"%",gx,h*.25+28,"#a8641c","bold 24px");txt(x,"Pendiente (6 meses)",gx,h*.6,DIM,"12px");txt(x,(b1>=0?"+":"")+fmt(b1,2)+" mil/mes",gx,h*.6+28,"#9B3FD9","bold 24px");
    val(c,"tn_r",nz);val(c,"tn_s",fmt(sl,1));o.out.innerHTML="<small>Tendencia real: "+fmt(sl,1)+" mil/mes. Con mucho ruido, el crecimiento de dos puntos puede incluso cambiar de signo; la pendiente usa todos los meses y se acerca más al valor real.</small>"};o.draw()};

V["iv-fraude"]=function(el){var o=canvas(lab(el,"Variables de fraude: ¿esta transacción es sospechosa?","Mueve el monto, cuántas transacciones hubo en la última hora y los minutos desde la anterior: las variables se combinan en un puntaje de riesgo."));
  var c=controls(o,slider("fr_m","Monto de la transacción ($)",50,30000,50,1800)+slider("fr_t","Transacciones en la última hora",1,20,1,2)+slider("fr_r","Minutos desde la anterior",0,600,1,240));sliders(o,c,["fr_m","fr_t","fr_r"]);var avg=900;
  o.draw=function(){var x=o.x,w=o.w,h=o.h,m=+c.querySelector("#fr_m").value,t=+c.querySelector("#fr_t").value,rc=+c.querySelector("#fr_r").value,ratio=m/avg,s1=clamp((ratio-1)/9,0,1),s2=clamp((t-2)/10,0,1),s3=clamp(1-rc/60,0,1),sc=clamp(.45*s1+.35*s2+.2*s3,0,1);x.clearRect(0,0,w,h);
    var F=[["Monto / promedio del cliente","×"+fmt(ratio,1),s1],["Transacciones última hora",t,s2],["Recencia (min)",rc,s3]],L=210,W=w*.6-L;F.forEach(function(f,i){var y=30+i*((h-50)/3);txt(x,f[0],L-10,y+12,INK,"12px","right");x.fillStyle="#eef1f6";rr(x,L,y,W,24,6);x.fill();x.fillStyle=f[2]>.6?"#D64545":f[2]>.3?"#F2A814":"#13A86A";rr(x,L,y,Math.max(4,f[2]*W),24,6);x.fill();txt(x,String(f[1]),L+W+8,y+12,DIM,"12px")});
    var gx=w*.68,col=sc>.6?"#D64545":sc>.3?"#F2A814":"#13A86A";x.fillStyle=col;rr(x,gx,h*.22,w*.28,h*.56,14);x.fill();txt(x,"Riesgo",gx+w*.14,h*.32,"rgba(255,255,255,.85)","12px","center");txt(x,fmt(sc*100,0),gx+w*.14,h*.48,"#fff","bold 34px","center");txt(x,sc>.6?"Bloquear y verificar":sc>.3?"Pedir confirmación":"Aprobar",gx+w*.14,h*.66,"#fff","bold 12px","center");
    val(c,"fr_m","$"+fmt(m));val(c,"fr_t",t);val(c,"fr_r",rc);o.out.innerHTML="<small>Gasto promedio de este cliente: $"+fmt(avg)+". Puntaje ilustrativo; en producción estas mismas variables alimentan un modelo entrenado con fraudes reales.</small>"};o.draw()};

V["iv-vibra"]=function(el){var o=canvas(lab(el,"Mantenimiento predictivo: volatilidad de la vibración","Mueve el día de inicio del desgaste: la desviación estándar móvil detecta el aumento de variabilidad antes de que la máquina falle."));
  var c=controls(o,slider("vb_d","Día en que empieza el desgaste",20,110,1,70)+slider("vb_w","Ventana de la desviación móvil",3,20,1,8)+slider("vb_u","Umbral de alerta",1,5,0.1,2.2));sliders(o,c,["vb_d","vb_w","vb_u"]);var r0=rnd(71),Z=[];for(var i=0;i<140;i++)Z.push(gauss(r0));
  o.draw=function(){var x=o.x,w=o.w,h=o.h,d0=+c.querySelector("#vb_d").value,win=+c.querySelector("#vb_w").value,th=+c.querySelector("#vb_u").value,N=140,S=Z.map(function(z,i){var amp=1+(i>d0?(i-d0)*.06:0);return 10+z*amp}),L=36,T=16,W=w-L-20,Ht=(h-T-40)*.55,Hb=(h-T-40)*.38,X=function(i){return L+i/(N-1)*W};x.clearRect(0,0,w,h);
    x.beginPath();S.forEach(function(v,i){var y=T+Ht/2-(v-10)/10*Ht/2;i?x.lineTo(X(i),y):x.moveTo(X(i),y)});x.strokeStyle="rgba(0,166,224,.75)";x.lineWidth=1.2;x.stroke();txt(x,"vibración del sensor",L,T+4,DIM,"11px");
    var by=T+Ht+20,alert=-1,SD=[];for(var i=0;i<N;i++){if(i<win){SD.push(null);continue}var seg=S.slice(i-win,i),m=seg.reduce(function(a,b){return a+b})/win,sd=Math.sqrt(seg.reduce(function(a,b){return a+(b-m)*(b-m)},0)/win);SD.push(sd);if(alert<0&&sd>th&&i>win)alert=i}
    x.beginPath();var st=false;SD.forEach(function(v,i){if(v==null)return;var y=by+Hb-v/6*Hb;st?x.lineTo(X(i),y):(x.moveTo(X(i),y),st=true)});x.strokeStyle="#C13CFF";x.lineWidth=2.5;x.stroke();
    var ty=by+Hb-th/6*Hb;x.strokeStyle="#D64545";x.setLineDash([5,4]);x.beginPath();x.moveTo(L,ty);x.lineTo(L+W,ty);x.stroke();x.setLineDash([]);txt(x,"desviación estándar móvil",L,by-4,DIM,"11px");
    vline(x,X(d0),T,h-T-30,"#9aa3b5","inicia desgaste",Ht+10);if(alert>0)vline(x,X(alert),by,Hb,"#D64545","alerta día "+alert,12);
    val(c,"vb_d",d0);val(c,"vb_w",win);val(c,"vb_u",fmt(th,1));o.out.innerHTML='<div class="kb-metricas"><span>Alerta: <b>'+(alert>0?"día "+alert:"sin alerta")+'</b></span><span>Anticipación vs. falla (día 140): <b>'+(alert>0?(140-alert)+" días":"—")+'</b></span></div><small>Umbral muy bajo: falsas alarmas por ruido normal. Muy alto: avisa demasiado tarde.</small>'};o.draw()};


/* ================= Algoritmos de Machine Learning (uno por algoritmo) ================= */
function sig(z){return 1/(1+Math.exp(-z))}
function tall(o,px){o.baseH=px;o.fit()}
function heat(x,L,T,W,H,f,cell){cell=cell||8;for(var i=0;i<W;i+=cell)for(var j=0;j<H;j+=cell){var p=f((i+cell/2)/W,1-(j+cell/2)/H);x.fillStyle="rgba("+Math.round(25+p*189)+","+Math.round(200-p*131)+","+Math.round(120-p*51)+",0.22)";x.fillRect(L+i,T+j,cell,cell)}}
function play(btn,frames,stepf,done){var t=null;btn.onclick=function(){clearInterval(t);var k=0;t=setInterval(function(){stepf(k++);if(k>=frames){clearInterval(t);done&&done()}},40)};return function(){clearInterval(t)}}

/* 4.1 Regresión lineal: precio de casas */
V["ia-linreg"]=function(el){var o=canvas(lab(el,"Regresión lineal en acción: precio de departamentos en CDMX","Presiona ▶ para ver cómo el modelo ajusta la recta paso a paso (descenso del gradiente). Los cuadrados son los errores al cuadrado que intenta hacer más pequeños."));tall(o,340);
  var c=controls(o,'<button type="button" class="kb-btn kb-btn-pri" id="lr_go">▶ Entrenar</button><button type="button" class="kb-btn" id="lr_rst">Reiniciar</button>'+slider("lr_m","Departamento nuevo (m²)",40,200,1,95)+'<label class="kb-check"><input type="checkbox" id="lr_sq" checked> Ver errores al cuadrado</label>');
  var r=rnd(101),D=[];for(var i=0;i<26;i++){var m=40+r()*160;D.push([m,0.8+0.034*m+gauss(r)*0.45])}var a,b,hist;function reset(){a=-0.3;b=2.2;hist=[]}reset();
  function mse(){var s=0;D.forEach(function(d){var xn=(d[0]-120)/50,e=b+a*xn-d[1];s+=e*e});return s/D.length}
  function step(){var ga=0,gb=0;D.forEach(function(d){var xn=(d[0]-120)/50,e=b+a*xn-d[1];ga+=e*xn;gb+=e});a-=0.12*ga/D.length*2;b-=0.12*gb/D.length*2;hist.push(mse())}
  var stp=play(c.querySelector("#lr_go"),70,function(){step();o.draw()});c.querySelector("#lr_rst").onclick=function(){stp();reset();o.draw()};sliders(o,c,["lr_m"]);c.querySelector("#lr_sq").onchange=function(){o.draw()};
  o.draw=function(){var x=o.x,w=o.w,h=o.h,L=50,T=18,W=w*.72-L,H=h-T-40,X=function(m){return L+(m-30)/180*W},Y=function(p){return T+H-p/9*H},pr=function(m){return b+a*(m-120)/50};x.clearRect(0,0,w,h);axis(x,L,T,W,H);
    if(c.querySelector("#lr_sq").checked)D.forEach(function(d){var e=pr(d[0])-d[1],s=Math.abs(Y(d[1])-Y(pr(d[0])));x.fillStyle=e>0?"rgba(214,69,69,.12)":"rgba(0,166,224,.12)";x.fillRect(X(d[0]),Math.min(Y(d[1]),Y(pr(d[0]))),Math.min(s,60),s)});
    D.forEach(function(d){x.strokeStyle="rgba(214,69,69,.5)";x.beginPath();x.moveTo(X(d[0]),Y(d[1]));x.lineTo(X(d[0]),Y(pr(d[0])));x.stroke();x.fillStyle="#1f2430";x.beginPath();x.arc(X(d[0]),Y(d[1]),4.5,0,7);x.fill()});
    x.strokeStyle=grad(x,L,L+W);x.lineWidth=3.5;x.beginPath();x.moveTo(X(30),Y(pr(30)));x.lineTo(X(210),Y(pr(210)));x.stroke();
    var nm=+c.querySelector("#lr_m").value,np=pr(nm);x.fillStyle="#F2A814";x.beginPath();x.arc(X(nm),Y(np),9,0,7);x.fill();x.strokeStyle="#fff";x.lineWidth=2;x.stroke();txt(x,"$"+fmt(np,2)+" M",X(nm)+12,Y(np)-12,INK,"bold 13px");
    for(var m=50;m<=200;m+=50)txt(x,m+" m²",X(m),T+H+14,DIM,"11px","center");for(var p=0;p<=8;p+=2)txt(x,"$"+p+"M",L-8,Y(p),DIM,"11px","right");
    var gx=w*.76,gw=w-gx-14,gh=h*.42;txt(x,"Error (MSE) por iteración",gx,T+4,INK,"bold 12px");x.strokeStyle="#e6e9f2";x.strokeRect(gx,T+16,gw,gh);if(hist.length){var mx=Math.max.apply(null,hist.concat([mse()]));x.beginPath();hist.forEach(function(v,i){var px=gx+i/69*gw,py=T+16+gh-v/mx*gh;i?x.lineTo(px,py):x.moveTo(px,py)});x.strokeStyle="#C13CFF";x.lineWidth=2;x.stroke()}
    var slope=a/50*1e6,inter=(b-a*120/50)*1e6;txt(x,"Iteraciones: "+hist.length,gx,T+gh+40,DIM,"12px");txt(x,"MSE = "+fmt(mse(),3),gx,T+gh+60,"#9B3FD9","bold 14px");
    val(c,"lr_m",nm+" m²");o.out.innerHTML='<div class="kb-metricas"><span>precio = <b>$'+fmt(inter,0)+' + $'+fmt(slope,0)+' × m²</b></span><span>Predicción para '+nm+' m²: <b>$'+fmt(np,2)+' millones</b></span></div><small>Cada m² adicional suma ~$'+fmt(slope,0)+'. Datos ilustrativos. La recta final es la que minimiza la suma de los cuadrados.</small>'};o.draw()};

/* 4.2 Regresión logística: aprobación de crédito */
V["ia-logreg"]=function(el){var o=canvas(lab(el,"Regresión logística en acción: ¿aprobamos el crédito?","Presiona ▶ para entrenar: el fondo es la probabilidad de impago y la línea es el umbral de decisión. Haz clic en la gráfica para evaluar un solicitante nuevo."));tall(o,340);
  var c=controls(o,'<button type="button" class="kb-btn kb-btn-pri" id="lg_go">▶ Entrenar</button><button type="button" class="kb-btn" id="lg_rst">Reiniciar</button>'+slider("lg_t","Umbral para rechazar",0.1,0.9,0.05,0.5));
  var r=rnd(202),D=[];for(var i=0;i<70;i++){var inc=12+r()*68,u=r(),z=5*(u-.55)-3.2*((inc-40)/30);D.push([inc,u,r()<sig(z*1.6)?1:0])}
  var w1,w2,w0,it,P=null;function reset(){w1=0;w2=0;w0=0;it=0}reset();function f(inc,u){return sig(w0+w1*(inc-40)/30+w2*(u-.5)*3)}
  function step(){var g1=0,g2=0,g0=0;D.forEach(function(d){var e=f(d[0],d[1])-d[2];g1+=e*(d[0]-40)/30;g2+=e*(d[1]-.5)*3;g0+=e});w1-=.6*g1/D.length*4;w2-=.6*g2/D.length*4;w0-=.6*g0/D.length*4;it++}
  var stp=play(c.querySelector("#lg_go"),80,function(){step();o.draw()});c.querySelector("#lg_rst").onclick=function(){stp();reset();P=null;o.draw()};sliders(o,c,["lg_t"]);
  var L=56,T=16;o.c.style.cursor="crosshair";o.c.addEventListener("click",function(e){var bb=o.c.getBoundingClientRect(),W=o.w*.68-L,H=o.h-T-50,px=((e.clientX-bb.left)/(o.sc||1)-L)/W,py=1-((e.clientY-bb.top)/(o.sc||1)-T)/H;if(px>=0&&px<=1&&py>=0&&py<=1){P=[10+px*75,py];o.draw()}});
  o.draw=function(){var x=o.x,w=o.w,h=o.h,W=w*.68-L,H=h-T-50,th=+c.querySelector("#lg_t").value,X=function(inc){return L+(inc-10)/75*W},Y=function(u){return T+H-u*H};x.clearRect(0,0,w,h);
    heat(x,L,T,W,H,function(px,py){return f(10+px*75,py)},8);x.strokeStyle="#c9cfdb";x.strokeRect(L,T,W,H);
    var ok=0;D.forEach(function(d){var pred=f(d[0],d[1])>=th?1:0;if(pred===d[2])ok++;x.fillStyle=d[2]?"#D64545":"#13A86A";x.beginPath();x.arc(X(d[0]),Y(d[1]),5,0,7);x.fill();x.strokeStyle="#fff";x.lineWidth=1.5;x.stroke()});
    if(Math.abs(w2)>1e-6){var lt=Math.log(th/(1-th));x.strokeStyle="#1f2430";x.lineWidth=2.5;x.setLineDash([6,4]);x.beginPath();var st=false;for(var inc=10;inc<=85;inc+=1){var u=((lt-w0-w1*(inc-40)/30)/(w2*3))+.5;if(u<0||u>1){continue}st?x.lineTo(X(inc),Y(u)):(x.moveTo(X(inc),Y(u)),st=true)}x.stroke();x.setLineDash([])}
    txt(x,"ingreso mensual (miles $) →",L+W,T+H+30,DIM,"11px","right");txt(x,"↑ % de uso de la línea de crédito",L+6,T+10,INK,"bold 11px");for(var inc=20;inc<=80;inc+=20)txt(x,"$"+inc+"k",X(inc),T+H+14,DIM,"10px","center");txt(x,"0%",L-6,Y(0),DIM,"10px","right");txt(x,"100%",L-6,Y(1),DIM,"10px","right");
    var gx=w*.72,gw=w-gx-14,gy=T+10,gh=h*.4;txt(x,"Función sigmoide",gx,gy,INK,"bold 12px");x.beginPath();for(var z=-6;z<=6;z+=.1){var px=gx+(z+6)/12*gw,py=gy+14+gh-sig(z)*gh;z===-6?x.moveTo(px,py):x.lineTo(px,py)}x.strokeStyle="#C13CFF";x.lineWidth=2.5;x.stroke();
    x.strokeStyle="#9aa3b5";x.setLineDash([3,3]);x.beginPath();x.moveTo(gx,gy+14+gh-th*gh);x.lineTo(gx+gw,gy+14+gh-th*gh);x.stroke();x.setLineDash([]);
    var msg="Haz clic en la gráfica para evaluar a un solicitante.";if(P){var pp=f(P[0],P[1]),zz=Math.log(pp/(1-pp));x.fillStyle="#F2A814";x.beginPath();x.arc(X(P[0]),Y(P[1]),9,0,7);x.fill();x.strokeStyle="#1f2430";x.lineWidth=2;x.stroke();x.fillStyle="#F2A814";x.beginPath();x.arc(gx+(clamp(zz,-6,6)+6)/12*gw,gy+14+gh-pp*gh,6,0,7);x.fill();
      msg="Solicitante: ingreso $"+fmt(P[0])+"k, uso "+fmt(P[1]*100)+"% → probabilidad de impago <b>"+fmt(pp*100,1)+"%</b> → <b>"+(pp>=th?'<span class="kb-alerta">Rechazar</span>':'<span class="kb-ok">Aprobar</span>')+"</b>";}
    txt(x,"Iteraciones: "+it,gx,gy+gh+40,DIM,"12px");txt(x,"Precisión: "+fmt(ok/D.length*100,0)+"%",gx,gy+gh+60,"#9B3FD9","bold 14px");[["pagó","#13A86A"],["no pagó","#D64545"]].forEach(function(q,i){x.fillStyle=q[1];x.beginPath();x.arc(gx+6+i*80,gy+gh+82,5,0,7);x.fill();txt(x,q[0],gx+15+i*80,gy+gh+82,DIM,"12px")});
    val(c,"lg_t",Math.round(th*100)+"%");o.out.innerHTML="<small>"+msg+" Fondo verde = bajo riesgo, rojo = alto riesgo. Bajar el umbral rechaza a más gente (menos impagos, pero se pierden buenos clientes).</small>"};o.draw()};

/* 4.4 Random Forest: churn */
V["ia-rf"]=function(el){var o=canvas(lab(el,"Random Forest en acción: ¿el cliente va a cancelar?","Cada árbol ve una muestra distinta de clientes y hace cortes rectos; el bosque promedia sus votos. Compara un solo árbol contra el bosque completo."));tall(o,340);
  var c=controls(o,seg("rv",["Un árbol","Bosque completo"],"Bosque completo")+slider("rf_n","Número de árboles",1,40,1,15)+slider("rf_k","Ver árbol número",1,40,1,1));var view="Bosque completo";onSeg(c,"rv",function(v){view=v;o.draw()});
  var r=rnd(303),D=[],Tt=[];function lab0(u,q){var z=1.6*(q-4.5)-0.18*(u-18)+1.2*Math.sin(u/5);return r()<sig(z*1.3)?1:0}for(var i=0;i<130;i++){var u=r()*40,q=r()*10,p=[u/40,q/10,lab0(u,q)];(i<100?D:Tt).push(p)}
  function gini(a){if(!a.length)return 0;var p=a.reduce(function(s,d){return s+d[2]},0)/a.length;return 2*p*(1-p)}
  function build(data,depth,rr){var p=data.length?data.reduce(function(s,d){return s+d[2]},0)/data.length:.5;if(depth>=4||data.length<6||p===0||p===1)return{leaf:p};var best=null,f=rr()<.5?0:1;
    for(var k=0;k<14;k++){var t=.05+rr()*.9,A=data.filter(function(d){return d[f]<t}),B=data.filter(function(d){return d[f]>=t});if(A.length<2||B.length<2)continue;var g=(A.length*gini(A)+B.length*gini(B))/data.length;if(!best||g<best.g)best={g:g,f:f,t:t,A:A,B:B}}
    if(!best)return{leaf:p};return{f:best.f,t:best.t,l:build(best.A,depth+1,rr),r:build(best.B,depth+1,rr)}}
  function pt(n,a,b){while(n.leaf===undefined)n=(n.f===0?a:b)<n.t?n.l:n.r;return n.leaf}
  var F=[],bs=[];for(var k=0;k<40;k++){var rg=rnd(400+k*13),s=[];for(var i=0;i<D.length;i++)s.push(D[Math.floor(rg()*D.length)]);bs.push(s);F.push(build(s,0,rg))}
  function forest(a,b,n){var t=0;for(var k=0;k<n;k++)t+=pt(F[k],a,b);return t/n}
  function acc(fn){var ok=0;Tt.forEach(function(d){if((fn(d[0],d[1])>=.5?1:0)===d[2])ok++});return ok/Tt.length}
  sliders(o,c,["rf_n","rf_k"]);
  o.draw=function(){var x=o.x,w=o.w,h=o.h,n=+c.querySelector("#rf_n").value,kk=Math.min(+c.querySelector("#rf_k").value,40)-1,L=46,T=16,W=w*.66-L,H=h-T-50,X=function(v){return L+v*W},Y=function(v){return T+H-v*H};x.clearRect(0,0,w,h);
    var fn=view==="Un árbol"?function(a,b){return pt(F[kk],a,b)}:function(a,b){return forest(a,b,n)};heat(x,L,T,W,H,fn,7);x.strokeStyle="#c9cfdb";x.strokeRect(L,T,W,H);
    var inB=view==="Un árbol"?bs[kk]:null;D.forEach(function(d){var faded=inB&&inB.indexOf(d)<0;x.globalAlpha=faded?.18:1;x.fillStyle=d[2]?"#D64545":"#13A86A";x.beginPath();x.arc(X(d[0]),Y(d[1]),4.5,0,7);x.fill();x.globalAlpha=1});
    txt(x,"uso del servicio (horas/mes) →",L+W,T+H+30,DIM,"11px","right");txt(x,"↑ quejas en el año",L+6,T+10,INK,"bold 11px");for(var v=0;v<=40;v+=10)txt(x,v,X(v/40),T+H+14,DIM,"10px","center");for(var q=0;q<=10;q+=5)txt(x,q,L-6,Y(q/10),DIM,"10px","right");
    var gx=w*.7,gw=w-gx-14,a1=acc(function(a,b){return pt(F[0],a,b)}),af=acc(function(a,b){return forest(a,b,n)});txt(x,"Precisión con clientes nuevos",gx,T+6,INK,"bold 12px");
    [["1 árbol",a1,"#9aa3b5"],[n+" árboles",af,"#C13CFF"]].forEach(function(q,i){var y=T+26+i*44;x.fillStyle="#eef1f6";rr(x,gx,y,gw,26,6);x.fill();x.fillStyle=q[2];rr(x,gx,y,gw*q[1],26,6);x.fill();txt(x,q[0]+": "+fmt(q[1]*100,0)+"%",gx+8,y+13,"#fff","bold 12px")});
    var cols=Math.min(8,n),cs=Math.min(22,gw/8);for(var k=0;k<n;k++){var cx=gx+(k%8)*cs,cy=T+130+Math.floor(k/8)*cs;x.fillStyle=view==="Un árbol"&&k===kk?"#F2A814":"#13A86A";x.beginPath();x.moveTo(cx+cs/2-1,cy+2);x.lineTo(cx+cs-4,cy+cs-8);x.lineTo(cx+2,cy+cs-8);x.closePath();x.fill();x.fillStyle="#8d6e63";x.fillRect(cx+cs/2-2,cy+cs-8,3,5)}
    [["canceló","#D64545"],["se quedó","#13A86A"]].forEach(function(q,i){x.fillStyle=q[1];x.beginPath();x.arc(gx+6+i*84,h-18,5,0,7);x.fill();txt(x,q[0],gx+15+i*84,h-18,DIM,"12px")});val(c,"rf_n",n);val(c,"rf_k",kk+1);
    o.out.innerHTML="<small>"+(view==="Un árbol"?"Árbol #"+(kk+1)+": solo ve su muestra bootstrap (puntos marcados) y sus cortes son rectos y bruscos; puede equivocarse mucho con clientes nuevos.":"El bosque promedia "+n+" árboles: la frontera se suaviza y el error con clientes nuevos baja. Fondo rojo = probabilidad alta de cancelar.")+"</small>"};o.draw()};

/* 4.5 XGBoost: demanda semanal */
V["ia-xgb"]=function(el){var o=canvas(lab(el,"XGBoost en acción: pronóstico de ventas semanales","Cada ronda agrega un árbol pequeño que corrige los errores (residuales) que dejó el anterior. Presiona ▶ y mira cómo la predicción se acerca a las ventas reales."));tall(o,350);
  var c=controls(o,'<button type="button" class="kb-btn kb-btn-pri" id="xg_go">▶ Entrenar 60 rondas</button>'+slider("xg_n","Rondas (árboles)",0,60,1,0)+slider("xg_e","Tasa de aprendizaje η",0.05,1,0.05,0.3));
  var r=rnd(505),Y=[];for(var i=0;i<52;i++){Y.push(100+25*Math.sin((i-10)/52*2*Math.PI)+(i===46?70:0)+(i===47?35:0)+(i>=49?30:0)+gauss(r)*7)}
  var models=[],eta=0;function fit(){eta=+c.querySelector("#xg_e").value;models=[];var pred=Y.map(function(){return Y.reduce(function(a,b){return a+b})/52});models.push({pred:pred.slice(),stump:null});
    for(var k=0;k<60;k++){var res=Y.map(function(v,i){return v-pred[i]}),best=null;for(var s=1;s<52;s++){var A=res.slice(0,s),B=res.slice(s),ma=A.reduce(function(a,b){return a+b})/A.length,mb=B.reduce(function(a,b){return a+b})/B.length,sse=0;A.forEach(function(v){sse+=(v-ma)*(v-ma)});B.forEach(function(v){sse+=(v-mb)*(v-mb)});if(!best||sse<best.sse)best={sse:sse,s:s,a:ma,b:mb}}
      pred=pred.map(function(v,i){return v+eta*(i<best.s?best.a:best.b)});models.push({pred:pred.slice(),stump:best,res:res})}}fit();
  var nS=c.querySelector("#xg_n");play(c.querySelector("#xg_go"),61,function(k){nS.value=k;o.draw()});nS.addEventListener("input",function(){o.draw()});c.querySelector("#xg_e").addEventListener("input",function(){fit();o.draw()});
  o.draw=function(){var x=o.x,w=o.w,h=o.h,n=+nS.value,m=models[n],L=46,T=16,W=w-L-20,Ht=(h-T-50)*.66,Hb=(h-T-50)*.3,X=function(i){return L+i/51*W},Yp=function(v){return T+Ht-(v-40)/180*Ht};x.clearRect(0,0,w,h);axis(x,L,T,W,Ht);
    for(var g=50;g<=200;g+=50)txt(x,g,L-6,Yp(g),DIM,"10px","right");Y.forEach(function(v,i){x.fillStyle="#1f2430";x.beginPath();x.arc(X(i),Yp(v),3.5,0,7);x.fill()});
    x.beginPath();m.pred.forEach(function(v,i){var px=X(i),py=Yp(v);if(i===0)x.moveTo(px,py);else{x.lineTo(px,Yp(m.pred[i-1]));x.lineTo(px,py)}});x.strokeStyle="#C13CFF";x.lineWidth=3;x.stroke();
    txt(x,"ventas reales (●) y predicción del modelo",L,T+4,DIM,"11px");txt(x,"Buen Fin",X(46),Yp(Y[46])-12,"#a8641c","bold 11px","center");txt(x,"Diciembre",X(50),Yp(Y[50])-12,"#a8641c","bold 11px","center");
    var by=T+Ht+30,res=Y.map(function(v,i){return v-m.pred[i]}),mr=60;x.strokeStyle="#c9cfdb";x.beginPath();x.moveTo(L,by+Hb/2);x.lineTo(L+W,by+Hb/2);x.stroke();
    res.forEach(function(v,i){var hh=clamp(v/mr,-1,1)*Hb/2;x.fillStyle=v>0?"rgba(0,166,224,.6)":"rgba(214,69,69,.6)";x.fillRect(X(i)-3,by+Hb/2-Math.max(hh,0),6,Math.abs(hh))});
    if(n<60&&models[n+1]){var s=models[n+1].stump;x.strokeStyle="#F2A814";x.lineWidth=2.5;x.beginPath();x.moveTo(X(0),by+Hb/2-clamp(s.a/mr,-1,1)*Hb/2);x.lineTo(X(s.s-.5),by+Hb/2-clamp(s.a/mr,-1,1)*Hb/2);x.lineTo(X(s.s-.5),by+Hb/2-clamp(s.b/mr,-1,1)*Hb/2);x.lineTo(X(51),by+Hb/2-clamp(s.b/mr,-1,1)*Hb/2);x.stroke()}
    txt(x,"residuales (lo que falta corregir) y el siguiente árbol en amarillo",L,by-8,DIM,"11px");for(var i=0;i<52;i+=13)txt(x,"sem "+(i+1),X(i),h-10,DIM,"10px","center");
    var rmse=Math.sqrt(res.reduce(function(a,b){return a+b*b},0)/52);val(c,"xg_n",n);val(c,"xg_e",fmt(+c.querySelector("#xg_e").value,2));
    o.out.innerHTML='<div class="kb-metricas"><span>Ronda: <b>'+n+'</b></span><span>Error RMSE: <b>'+fmt(rmse,1)+' piezas</b></span></div><small>'+(n===0?"Ronda 0: el modelo solo predice el promedio. Presiona ▶.":"Cada árbol es solo un corte (antes/después de cierta semana); sumando muchos con pasos pequeños (η) se aprende la temporada y el pico del Buen Fin. Con η alto aprende rápido pero se arriesga a sobreajustar.")+'</small>'};o.draw()};

/* 4.7 SVM: fraude */
V["ia-svm"]=function(el){var o=canvas(lab(el,"SVM en acción: separar transacciones normales y fraudes","La SVM busca la frontera con el margen más ancho posible; los puntos marcados con aro son los vectores de soporte. En el caso circular, el kernel permite una frontera curva."));tall(o,380);
  var c=controls(o,seg("sd",["Datos separables","Datos en círculo"],"Datos separables")+seg("sk",["Kernel lineal","Kernel RBF"],"Kernel lineal")+slider("sv_c","Penalización C (tolerancia a errores)",0.1,10,0.1,1));var ds="Datos separables",ker="Kernel lineal";
  var r=rnd(606),A=[],B=[];for(var i=0;i<40;i++){A.push([.3+gauss(r)*.09,.35+gauss(r)*.09,-1]);A.push([.68+gauss(r)*.09,.68+gauss(r)*.09,1])}for(var i=0;i<80;i++){var ang=r()*6.283,rad=i<40?r()*.16:.28+r()*.1;B.push([.5+Math.cos(ang)*rad,.5+Math.sin(ang)*rad,i<40?-1:1])}A.pop();
  var Wt=null,sv=[];function feat(p){return ker==="Kernel RBF"?[(p[0]-.5)*2,(p[1]-.5)*2,(Math.pow(p[0]-.5,2)+Math.pow(p[1]-.5,2))*12,1]:[(p[0]-.5)*2,(p[1]-.5)*2,0,1]}
  function train(){var D=ds==="Datos separables"?A:B,C=+c.querySelector("#sv_c").value,lam=1/(C*D.length),w=[0,0,0,0],av=[0,0,0,0],rr=rnd(9),NT=20000;for(var t=1;t<=NT;t++){var d=D[Math.floor(rr()*D.length)],f=feat(d),m=d[2]*(w[0]*f[0]+w[1]*f[1]+w[2]*f[2]+w[3]*f[3]),eta=1/(lam*t);w=w.map(function(v,i){return i===3?v:(1-eta*lam)*v});if(m<1)w=w.map(function(v,i){return v+(i===3?Math.min(eta,.5):eta)*d[2]*f[i]});if(t>NT/2)av=av.map(function(v,i){return v+w[i]/(NT/2)})}w=av;Wt=w;
    sv=D.filter(function(d){var f=feat(d);return d[2]*(w[0]*f[0]+w[1]*f[1]+w[2]*f[2]+w[3]*f[3])<=1.05})}
  function sc(p){var f=feat(p);return Wt[0]*f[0]+Wt[1]*f[1]+Wt[2]*f[2]+Wt[3]*f[3]}
  onSeg(c,"sd",function(v){ds=v;train();o.draw()});onSeg(c,"sk",function(v){ker=v;train();o.draw()});c.querySelector("#sv_c").addEventListener("input",function(){train();o.draw()});train();
  o.draw=function(){var x=o.x,w=o.w,h=o.h,D=ds==="Datos separables"?A:B,L=46,T=16,S=Math.min(w*.62-L,h-T-40),X=function(v){return L+v*S},Y=function(v){return T+S-v*S};x.clearRect(0,0,w,h);
    for(var i=0;i<S;i+=6)for(var j=0;j<S;j+=6){var v=sc([(i+3)/S,1-(j+3)/S]);x.fillStyle=Math.abs(v)<1?"rgba(242,232,20,.22)":(v>0?"rgba(214,69,69,.13)":"rgba(25,227,107,.13)");x.fillRect(L+i,T+j,6,6)}
    x.fillStyle="#1f2430";for(var i=0;i<S;i+=2)for(var j=0;j<S;j+=2){var v=sc([i/S,1-j/S]),v2=sc([(i+2)/S,1-j/S]),v3=sc([i/S,1-(j+2)/S]);if(v*v2<=0||v*v3<=0)x.fillRect(L+i-1,T+j-1,3,3)}
    x.strokeStyle="#c9cfdb";x.strokeRect(L,T,S,S);var ok=0;D.forEach(function(d){if((sc(d)>0?1:-1)===d[2])ok++;x.fillStyle=d[2]>0?"#D64545":"#13A86A";x.beginPath();x.arc(X(d[0]),Y(d[1]),4.5,0,7);x.fill()});
    sv.forEach(function(d){x.strokeStyle="#1f2430";x.lineWidth=1.8;x.beginPath();x.arc(X(d[0]),Y(d[1]),8,0,7);x.stroke()});
    txt(x,ds==="Datos separables"?"monto (normalizado)":"monto vs. promedio del cliente",L+S,T+S+16,DIM,"11px","right");txt(x,ds==="Datos separables"?"hora (normalizada)":"distancia al domicilio",L,T-4,DIM,"11px");
    var gx=w*.66,acc1=ok/D.length,mg=2/Math.max(1e-6,Math.hypot(Wt[0],Wt[1],Wt[2]));txt(x,"Precisión: "+fmt(acc1*100,0)+"%",gx,T+20,acc1>.9?"#0e7a4d":"#b53333","bold 18px");txt(x,"Vectores de soporte: "+sv.length,gx,T+50,INK,"13px");txt(x,"Ancho del margen: "+fmt(mg,3),gx,T+72,INK,"13px");
    txt(x,"■ franja amarilla = margen",gx,T+110,"#a8641c","12px");[["fraude","#D64545"],["normal","#13A86A"]].forEach(function(q,i){x.fillStyle=q[1];x.beginPath();x.arc(gx+6+i*80,T+132,5,0,7);x.fill();txt(x,q[0],gx+15+i*80,T+132,DIM,"12px")});
    val(c,"sv_c",fmt(+c.querySelector("#sv_c").value,1));
    o.out.innerHTML="<small>"+(ds==="Datos en círculo"&&ker==="Kernel lineal"?'<span class="kb-alerta">Una línea recta no puede separar un círculo.</span> Cambia a kernel RBF: los datos se proyectan a otra dimensión donde sí se separan.':ker==="Kernel RBF"&&ds==="Datos en círculo"?"Con kernel RBF la frontera se vuelve curva y encierra a las transacciones normales: los fraudes quedan fuera del círculo.":"C bajo = margen ancho que tolera errores (generaliza mejor); C alto = margen estrecho que intenta no fallar ninguno (riesgo de sobreajuste).")+"</small>"};o.draw()};


/* 1.4 Data-driven: reglas escritas a mano vs. modelo que aprende de datos */
V["ia-datadriven"]=function(el){var o=canvas(lab(el,"Data-driven en acción: reglas fijas vs. un modelo que aprende de los datos","Caso real: detectar compras fraudulentas. La regla fija bloquea “montos altos de noche”. El modelo data-driven aprende de las transacciones que ya ocurrieron. Agrega datos y mira quién se equivoca menos."));tall(o,360);
  var c=controls(o,seg("dd",["Regla fija","Data-driven","Comparar"],"Comparar")+slider("dd_n","Transacciones históricas para aprender",10,1500,10,40)+'<button type="button" class="kb-btn kb-btn-pri" id="dd_go">▶ Ver cómo aprende</button>');var mode="Comparar";onSeg(c,"dd",function(v){mode=v;o.draw()});
  var r=rnd(777),ALL=[];function isF(m,h){var hn=Math.abs(h-.12)<.14||h>.9;return (m>.55&&hn)||(m>.3&&m<.5&&h>.4&&h<.62)||(m>.85)}
  for(var i=0;i<1700;i++){var m=r(),h=r(),y=isF(m,h)?1:0;if(r()<.07)y=1-y;ALL.push([m,h,y])}var TR=ALL.slice(0,1500),TE=ALL.slice(1500);
  function rule(m,h){return m>.6&&(h<.25||h>.85)?1:0}
  var G=14,grid=null,gn=-1;function learn(n){if(gn===n)return;gn=n;grid=[];for(var i=0;i<G;i++){grid.push([]);for(var j=0;j<G;j++)grid[i].push([.5,2])}for(var k=0;k<n;k++){var d=TR[k],i=Math.min(G-1,Math.floor(d[0]*G)),j=Math.min(G-1,Math.floor(d[1]*G));grid[i][j][0]+=d[2];grid[i][j][1]+=1}}
  function model(m,h){var i=clamp(Math.floor(m*G),0,G-1),j=clamp(Math.floor(h*G),0,G-1),g=grid[i][j];return g[0]/g[1]}
  function acc(fn){var ok=0;TE.forEach(function(d){if((fn(d[0],d[1])>=.5?1:0)===d[2])ok++});return ok/TE.length}
  var nS=c.querySelector("#dd_n");nS.addEventListener("input",function(){o.draw()});
  var steps=[10,20,40,80,150,250,400,600,850,1100,1500];play(c.querySelector("#dd_go"),steps.length*6,function(k){nS.value=steps[Math.floor(k/6)];o.draw()});
  function panel(x,L,T,S,title,fn,n){x.save();for(var i=0;i<S;i+=6)for(var j=0;j<S;j+=6){var p=fn((i+3)/S,1-(j+3)/S);x.fillStyle=p>=.5?"rgba(214,69,69,.20)":"rgba(19,168,106,.10)";x.fillRect(L+i,T+j,6,6)}
    x.strokeStyle="#c9cfdb";x.strokeRect(L,T,S,S);var show=Math.max(n,60);for(var k=0;k<Math.min(show,400);k++){var d=TR[k],seen=k<n;x.globalAlpha=seen?1:.15;x.fillStyle=d[2]?"#D64545":"#13A86A";x.beginPath();x.arc(L+d[0]*S,T+(1-d[1])*S,seen?3.2:2.4,0,7);x.fill()}x.globalAlpha=1;
    txt(x,title,L,T-10,INK,"bold 13px");txt(x,"eje horizontal: monto →   ·   eje vertical: hora del día ↑",L,T+S+14,DIM,"10px");x.restore()}
  o.draw=function(){var x=o.x,w=o.w,h=o.h,n=+nS.value;learn(n);x.clearRect(0,0,w,h);var T=30,S=Math.min(h-T-34,(w*.68-40)/(mode==="Comparar"?2:1)-20),L=24;
    if(mode!=="Data-driven"){panel(x,L,T,S,"Regla escrita a mano",rule,n);L+=S+36}if(mode!=="Regla fija")panel(x,L,T,S,"Modelo data-driven ("+fmt(n)+" datos)",model,n);
    var gx=w*.7,gw=w-gx-16,gy=T,gh=h*.46,ar=acc(rule),am=acc(model);txt(x,"Aciertos con compras nuevas",gx,gy-10,INK,"bold 12px");x.strokeStyle="#e6e9f2";x.strokeRect(gx,gy,gw,gh);
    var Yq=function(a){return gy+gh-(clamp(a,.4,1)-.4)/.6*gh},Xq=function(v){return gx+Math.log(v/10)/Math.log(150)*gw};
    x.strokeStyle="#9aa3b5";x.lineWidth=2;x.setLineDash([5,4]);x.beginPath();x.moveTo(gx,Yq(ar));x.lineTo(gx+gw,Yq(ar));x.stroke();x.setLineDash([]);
    x.beginPath();steps.forEach(function(v,i){learn(v);var a=acc(model);i?x.lineTo(Xq(v),Yq(a)):x.moveTo(Xq(v),Yq(a))});x.strokeStyle="#C13CFF";x.lineWidth=2.5;x.stroke();learn(n);
    x.fillStyle="#F2A814";x.beginPath();x.arc(Xq(n),Yq(am),6,0,7);x.fill();txt(x,"10",gx,gy+gh+12,DIM,"10px");txt(x,"1,500 datos",gx+gw,gy+gh+12,DIM,"10px","right");
    txt(x,"— — regla: "+fmt(ar*100)+"%",gx,gy+gh+34,"#6b7385","bold 13px");txt(x,"—— modelo: "+fmt(am*100)+"%",gx,gy+gh+54,"#9B3FD9","bold 13px");
    var cy=gy+gh+80,lbl=["Datos","Modelo","Decisión","Resultado"];lbl.forEach(function(t,i){var bx=gx+i*(gw/4);x.fillStyle=i===Math.floor(Date.now()/700)%4?"#C13CFF":"#eef1f6";rr(x,bx+2,cy,gw/4-6,24,6);x.fill();txt(x,t,bx+gw/8-2,cy+12,i===Math.floor(Date.now()/700)%4?"#fff":INK,"bold 10px","center")});txt(x,"↺ los resultados vuelven a ser datos",gx,cy+40,DIM,"10px");
    val(c,"dd_n",fmt(n));o.out.innerHTML='<div class="kb-metricas"><span>Regla fija: <b>'+fmt(ar*100)+'% de aciertos</b> (no cambia)</span><span>Data-driven: <b>'+fmt(am*100)+'% de aciertos</b></span></div><small>'+(n<100?"Con pocos datos el modelo todavía adivina; aquí la regla puede ganar.":am>ar?"Con suficientes datos el modelo descubre zonas de fraude que la regla no contemplaba (por ejemplo, montos medios a mediodía) y supera a la regla.":"El modelo ya casi alcanza a la regla; agrega más datos.")+" Fondo rojo = se bloquea la compra. Datos simulados.</small>"};
  o.draw();setInterval(function(){if(el.getBoundingClientRect().top<innerHeight&&el.getBoundingClientRect().bottom>0)o.draw()},700)};

[].forEach.call(document.querySelectorAll(".vz-lab[data-viz]"),function(el){var f=V[el.getAttribute("data-viz")];if(f)try{f(el)}catch(e){console.error(e)}});
})();
