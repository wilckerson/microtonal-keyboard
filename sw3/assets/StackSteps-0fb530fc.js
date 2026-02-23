import{d as v,r as p,o as f,a6 as C,y as r,b as e,L as b,K as d,O as k,t as w,a4 as $,at as y,R as S}from"./index-1fe839ca.js";import{_ as g}from"./ModalDialog.vue_vue_type_style_index_0_lang-b56a85c4.js";const x={class:"control-group"},B={class:"control"},T={class:"btn-group"},O=v({__name:"StackSteps",props:{show:{type:Boolean}},emits:["update:source","update:scaleName","cancel"],setup(D,{emit:c}){const n=c,a=p(""),u=p("1/1");function m(){const o=a.value+`
str(sanitize(prod($)))`;try{u.value=S.evaluateExpression(o)}catch{}}const i=$(m);function l(o=!0){const t=a.value+`
stack()`;o?n("update:source",y(t)):n("update:source",t),n("update:scaleName","Custom steps")}return(o,t)=>(f(),C(g,{show:o.show,onConfirm:l,onCancel:t[5]||(t[5]=s=>o.$emit("cancel"))},{header:r(()=>t[6]||(t[6]=[e("h2",null,"Stack relative scale steps",-1)])),body:r(()=>[e("div",x,[t[7]||(t[7]=e("h3",null,"Scale data",-1)),e("div",B,[b(e("textarea",{rows:"20","onUpdate:modelValue":t[0]||(t[0]=s=>a.value=s),placeholder:`9/8
10/9
6/5
10/9
6/5`,onInput:t[1]||(t[1]=(...s)=>d(i)&&d(i)(...s))},null,544),[[k,a.value]])]),e("label",null,"Total: "+w(u.value),1)])]),footer:r(()=>[e("div",T,[e("button",{onClick:t[2]||(t[2]=()=>l(!0))},"OK"),e("button",{onClick:t[3]||(t[3]=s=>o.$emit("cancel"))},"Cancel"),e("button",{onClick:t[4]||(t[4]=()=>l(!1))},"Raw")])]),_:1},8,["show"]))}});export{O as default};
