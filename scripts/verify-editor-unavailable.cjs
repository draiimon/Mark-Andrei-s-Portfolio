const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
process.loadEnvFile('.env');
const log=fs.openSync('.local/editor-verification/unavailable.log','w');
const server=spawn(process.execPath,['artifacts/api-server/dist/index.mjs'],{windowsHide:true,env:{...process.env,DATABASE_URL:'',PORT:'3102',STATIC_ROOT:'',NODE_ENV:'production'},stdio:['ignore',log,log]});
(async()=>{
 try {
  for(let i=0;i<30;i++){try{if((await fetch('http://localhost:3102/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
  const login=await fetch('http://localhost:3102/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  for(const endpoint of ['profile','projects','resume','site-media?key=favicon']){
   const response=await fetch(`http://localhost:3102/api/edit/${endpoint}`,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({fullName:'Must not save'})});
   assert.equal(response.status,503);
   assert.match((await response.json()).error,/DATABASE_URL/);
  }
  assert.equal((await fetch('http://localhost:3102/api/public/portfolio')).status,200);
  assert.equal((await fetch('http://localhost:3102/api/edit/profile',{headers:{Cookie:'portfolio_admin=true'}})).status,401);
  console.log('Missing database: save routes return useful 503 responses, public fallback works, forged session rejected.');
 }finally{const exited=new Promise(r=>server.once('exit',r));server.kill();await exited;}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
