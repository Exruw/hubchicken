class Tokenizer{constructor(e){this.str=e,this.pos=0}getContext(e,t){let n=this.pos,r=this.str,i=Math.max(0,n-e),o=Math.min(r.length,n+e+1);return 0===i&&(e=n),t=t||0,r.substring(i,o)+"\n"+" ".repeat(e+t)+"^"}next(){return this.pos+=1,this.peek()}peek(){return this.str[this.pos]}back(){return this.pos-=1,this.pos<0&&(this.pos=0),this.peek()}eof(){return void 0===this.peek()}error(e,t){return this.getContext(32,0)+"\n"+e+": "+t}}export function parseTheme(e){let t=[],n=new Tokenizer(e),r="",i,o=function(){let e={type:"option",idx:r,value:""},t=!1;for(;!n.eof();){let i=n.next();if(";"===i)break;if("\n"===i)return n.error("SyntaxError","Unexpected option assign ending.");(" "!==i||t)&&(t=!0,e.value+=i)}return n.eof()||""===e.value?n.error("SyntaxError","Unexpected end of input."):e};for(;!n.eof();){let s=n.peek();if(":"===s){let u=o();if("string"==typeof u)return u;if("Boundary"===u.idx){i=u.value,r="",n.next();continue}t.push(u),r="",n.next();continue}if("\n"===s){if(r===i){r="";let f={type:"closure",ast:[]},p=!1,a=0;for(;;){if(n.eof())return n.error("SyntaxError","Unexpected end of input.");let x=n.next();if(":"===x&&!p){let c=o();if("string"==typeof c)return c;if("Start-Content"===c.idx){p=!0,r="";continue}f.ast.push(c),r="";continue}if(!p){if("\n"===x){r="";continue}r+=x;continue}if(p){if(r+=x,"\n"===x){a=0;continue}if(-1===a)continue;if(x===i[a]){if((a+=1)===i.length){r=r.substring(0,r.length-i.length),f.ast.push({type:"text",value:r});break}}else a=-1}}if(!p)return n.error("SyntaxError","Expected content for closure.");r="",n.next(),t.push(f);continue}r="",n.next();continue}" "!==s&&(r+=s),n.next()}return i?t:n.error("SyntaxError","No boundary was declared.")}