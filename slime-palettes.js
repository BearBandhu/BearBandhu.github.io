window.SLIME_PALETTES={
body:[
{id:'moss',n:'Moss',v:{hi:'226,250,232',mid:'126,214,146',deep:'48,142,64',edge:'22,78,36'}},
{id:'lilac',n:'Lilac',v:{hi:'242,237,255',mid:'193,176,246',deep:'122,95,230',edge:'56,38,124'}},
{id:'ember',n:'Ember',v:{hi:'255,240,230',mid:'255,199,158',deep:'233,122,78',edge:'122,52,24'}},
{id:'tide',n:'Tide',v:{hi:'233,244,255',mid:'169,210,255',deep:'62,134,214',edge:'23,63,114'}},
{id:'blush',n:'Blush',v:{hi:'255,237,244',mid:'255,182,210',deep:'231,92,147',edge:'112,32,66'}},
{id:'ink',n:'Ink',v:{hi:'240,240,245',mid:'186,186,200',deep:'92,92,110',edge:'28,26,36'}},
{id:'citrus',n:'Citrus',v:{hi:'255,250,225',mid:'250,226,120',deep:'216,168,32',edge:'104,74,10'}},
{id:'teal',n:'Teal',v:{hi:'228,252,249',mid:'150,232,222',deep:'42,158,146',edge:'14,72,68'}},
{id:'cocoa',n:'Cocoa',v:{hi:'249,238,228',mid:'216,180,152',deep:'150,102,68',edge:'62,38,22'}},
{id:'grape',n:'Grape',v:{hi:'246,232,255',mid:'214,158,246',deep:'146,62,200',edge:'62,22,92'}},
{id:'coral',n:'Coral',v:{hi:'255,238,236',mid:'255,176,164',deep:'236,92,80',edge:'112,32,26'}},
{id:'frost',n:'Frost',v:{hi:'255,255,255',mid:'226,238,246',deep:'168,190,206',edge:'78,98,112'}}
],
face:[
{id:'leaf',n:'Leaf',v:'70,176,92'},{id:'violet',n:'Violet',v:'140,116,232'},{id:'apricot',n:'Apricot',v:'240,160,110'},
{id:'sky',n:'Sky',v:'95,160,224'},{id:'rose',n:'Rose',v:'232,127,168'},{id:'cream',n:'Cream',v:'237,230,218'},
{id:'lime',n:'Lime',v:'176,214,84'},{id:'teal',n:'Teal',v:'56,178,166'},{id:'butter',n:'Butter',v:'244,208,104'},
{id:'clay',n:'Clay',v:'186,122,88'},{id:'slate',n:'Slate',v:'118,128,148'},{id:'ivory',n:'Ivory',v:'252,250,244'}
],
eyes:[
{id:'rect',n:'Rounded'},{id:'round',n:'Round'},{id:'oval',n:'Oval'},{id:'sleepy',n:'Sleepy'},
{id:'spark',n:'Sparkle'},{id:'wink',n:'Wink'},{id:'wide',n:'Wide'},{id:'tall',n:'Tall'},
{id:'cross',n:'Cross'},{id:'angry',n:'Angry'},{id:'dizzy',n:'Dizzy'},{id:'bead',n:'Bead'}
],
def:{body:'ink',face:'cream',eyes:'rect'},
/* read the saved look and paint it onto :root — used by every page */
paint:function(){
var P=window.SLIME_PALETTES,s=Object.assign({},P.def);
try{var j=JSON.parse(localStorage.getItem('slime-look')||'null');if(j&&j.body&&j.face&&j.eyes)s=j}catch(e){}
var b=(P.body.filter(function(x){return x.id===s.body})[0]||P.body[0]).v,
f=(P.face.filter(function(x){return x.id===s.face})[0]||P.face[0]).v,
r=document.documentElement.style;
r.setProperty('--sl-hi',b.hi);r.setProperty('--sl-mid',b.mid);r.setProperty('--sl-deep',b.deep);r.setProperty('--sl-edge',b.edge);
r.setProperty('--sl-face',f);
r.setProperty('--sl-eye',(s.face==='cream'||s.face==='ivory'||s.face==='butter')?'60,48,40':'14,52,24');
document.documentElement.setAttribute('data-eyes',s.eyes);
return s}
};