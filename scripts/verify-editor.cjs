const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('../.local/browser-check/node_modules/playwright');
process.loadEnvFile('.env');
const base = process.env.EDITOR_TEST_URL || 'http://localhost:3100';
assert.match(new URL(base).hostname, /^(localhost|127\.0\.0\.1)$/);
const sections = ['profile','projects','experience','leadership','taglines','achievements','resume','site-media'];
const out = '.local/editor-verification';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 assert.equal((await (await fetch(`${base}/health`)).json()).commit,'editor-isolated-verification','Only run mutation tests against the isolated test server.');
 const browser = await chromium.launch({headless:true});
 const errors=[];
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', message=>{if(message.type()==='error'&&!/Failed to load resource.*status of (400|401)/.test(message.text()))errors.push(message.text())});
  page.on('requestfailed', request=>{if(!/ERR_ABORTED/.test(request.failure()?.errorText||''))errors.push(`${request.failure()?.errorText} ${request.url()}`)});
  page.on('response', r=>{if(r.status()>=500)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(`${base}/edit`);
  await page.getByPlaceholder('draiimon').fill(process.env.ADMIN_USERNAME);
  await page.getByPlaceholder('Enter password').fill('wrong-password');
  await page.getByRole('button',{name:'Enter Edit Mode'}).click();
  await page.getByText('Invalid credentials',{exact:true}).waitFor();
  await page.getByPlaceholder('Enter password').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button',{name:'Enter Edit Mode'}).click();
  await page.locator('.edit-control-center').waitFor();
  await page.waitForFunction(()=>document.querySelector('.edit-dashboard-meta')?.textContent.includes('content records'));
  const api=async(path,method='GET',data)=>{
   const res=await context.request.fetch(`${base}/api/${path}`, {method,...(data!==undefined?{data}: {})});
   assert.ok(res.ok(),`${method} ${path}: ${res.status()} ${await res.text()}`);
   return res.json();
  };
  const publicData=()=>api('public/portfolio');
  const baseline=await publicData();
  const profileFields='fullName headline location email phone github linkedinUrl facebookUrl discordUrl instagramUrl spotifyUrl musicUrl cloudinaryCloudName cloudinaryUploadPreset objective about skills viewCount availability brandName heroTagline tabTitle faviconUrl socialImageUrl featuredLabel experienceTitle leadershipTitle achievementsTitle contactLabel footerCenterText footerRightText aiBehaviorPrompt'.split(' ');
  for(const field of profileFields){
   const value=field==='viewCount'?4321:field==='email'?'editor@example.com':/Url$/.test(field)||field==='github'?'https://example.com/editor-test':`Editor verification ${field}`;
   await api('edit/profile','POST',{[field]:value});
   assert.equal((await api('edit/profile'))[field],value,`${field} editor persistence`);
   assert.equal((await publicData()).profile[field],value,`${field} public persistence`);
  }
  await api('edit/profile','POST',Object.fromEntries(profileFields.map(k=>[k,baseline.profile[k]])));
  console.log(`Profile: ${profileFields.length} fields saved and read back through editor and public API.`);
  const fixtures={
   projects:{name:'Editor verification project',tagline:'Test tagline',description:'Test description',techStack:'TypeScript',link:null,githubUrl:null,highlight:false},
   experience:{role:'Test engineer',company:'Verification',period:'2026',summary:'Test summary',sortOrder:80},
   leadership:{org:'Verification',role:'Test lead',period:'2026',sortOrder:80},
   achievements:{text:'Verification achievement',sortOrder:80},
   taglines:{text:'Verification tagline',sortOrder:80},
  };
  for(const [section,data] of Object.entries(fixtures)){
   const created=await api(`edit/${section}`,'POST',data);
   const field=section==='projects'?'name':section==='experience'||section==='leadership'?'role':'text';
   const value=`Updated ${section} verification`;
   await api(`edit/${section}/${created.id}`,'PATCH',{[field]:value});
   assert.equal((await api(`edit/${section}`)).find(x=>x.id===created.id)[field],value);
   assert.equal((await publicData())[section].find(x=>x.id===created.id)[field],value);
   const bad=await context.request.patch(`${base}/api/edit/${section}/${created.id}`,{data:{[field]:null}});
   assert.equal(bad.status(),400);
   assert.equal((await api(`edit/${section}`)).find(x=>x.id===created.id)[field],value);
   assert.equal((await context.request.patch(`${base}/api/edit/${section}/${created.id}`,{data:{id:99}})).status(),400);
   if(section!=='projects'){
    const ids=(await api(`edit/${section}`)).map(x=>x.id).reverse();
    await api(`edit/${section}/reorder`,'POST',{ids});
    assert.deepEqual((await api(`edit/${section}`)).map(x=>x.id),ids);
    assert.equal((await context.request.post(`${base}/api/edit/${section}/reorder`,{data:{ids:[created.id]}})).status(),409);
   }
   await api(`edit/${section}/${created.id}`,'DELETE');
   assert.ok(!(await publicData())[section].some(x=>x.id===created.id));
   console.log(`${section}: create, patch, public content, validation, ${section==='projects'?'':'atomic reorder, '}delete passed.`);
  }
  for(const data of [{viewCount:-1},{viewCount:'abc'},{fullName:null},{fullName:''},{musicUrl:'javascript:alert(1)'},[],{id:2}])assert.equal((await context.request.post(`${base}/api/edit/profile`,{data})).status(),400);
  const beforeFailure=(await api('edit/profile')).headline;
  const failedSave=await context.request.post(`${base}/api/edit/profile`,{data:{headline:'__editor_storage_failure__'}});
  assert.equal(failedSave.status(),500);
  assert.ok((await failedSave.json()).error);
  assert.equal((await api('edit/profile')).headline,beforeFailure);
  assert.equal((await publicData()).profile.headline,beforeFailure);
  console.log('Forced database rejection: HTTP 500 with useful JSON; editor and public content remain unchanged.');
  assert.equal((await context.request.post(`${base}/api/edit/profile`,{data:'{',headers:{'Content-Type':'application/json'}})).status(),400);
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64');
  for(const key of ['favicon','social']){
   const res=await context.request.post(`${base}/api/edit/site-media?key=${key}`,{data:png,headers:{'Content-Type':'image/png'}});
   assert.equal(res.status(),200,await res.text());
   const {url}=await res.json();
   const media=await context.request.get(`${base}${url}`);
   assert.deepEqual(await media.body(),png);
   assert.equal((await publicData()).profile[key==='favicon'?'faviconUrl':'socialImageUrl'],url);
   if(key==='social')assert.ok((await (await context.request.get(`${base}/home`)).text()).includes(url), 'Saved social image is present in server-rendered metadata');
  }
  const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
  assert.equal((await context.request.post(`${base}/api/edit/resume`,{data:pdf,headers:{'Content-Type':'application/pdf'}})).status(),200);
  assert.deepEqual(await (await context.request.get(`${base}/api/resume`)).body(),pdf);
  assert.equal((await context.request.post(`${base}/api/edit/resume`,{data:Buffer.from('invalid'),headers:{'Content-Type':'application/pdf'}})).status(),400);
  assert.equal((await context.request.post(`${base}/api/edit/site-media?key=social`,{data:Buffer.from('invalid'),headers:{'Content-Type':'image/png'}})).status(),400);
  console.log('Resume and both images: stored bytes match downloads; invalid files rejected.');
  await page.reload();
  await page.locator('.edit-control-center').waitFor();
  await page.locator('.edit-hero-nav button').filter({hasText:'Profile'}).click();
  const fullName=page.locator('#profile label').filter({has:page.locator('span').filter({hasText:/^Full Name$/})}).locator('input');
  await fullName.fill('Editor UI verification');
  await page.getByRole('button',{name:'Save profile',exact:true}).click();
  await page.getByText('Profile updated.',{exact:true}).waitFor();
  await page.locator('.edit-notice.is-success').waitFor({state:'detached',timeout:6000});
  console.log('Success notification dismisses automatically within 3.5 seconds.');
  await page.reload();
  await page.locator('.edit-hero-nav button').filter({hasText:'Profile'}).click();
  assert.equal(await fullName.inputValue(),'Editor UI verification');
  await page.goto(`${base}/home`);
  await page.waitForFunction(()=>document.querySelector('.portfolio-page-content')?.textContent.replace(/\s/g,' ').includes('Editor UI verification'));
  console.log('Profile form save, authenticated refresh and rendered Home content passed.');
  await page.goto(`${base}/edit`);
  await page.locator('.edit-control-center').waitFor();
  for(const section of ['projects','experience','leadership','achievements']){
   await page.locator('.edit-hero-nav button').filter({hasText:new RegExp(`^${section}`, 'i')}).click();
   const panel=page.locator(`#${section}`);
   await panel.getByRole('button',{name:'Edit',exact:true}).first().click();
   const form=panel.locator('form').first();
   const inputs=form.locator('input:not([type="checkbox"]),textarea');
   for(let i=0;i<await inputs.count();i++){
    const input=inputs.nth(i);const placeholder=await input.getAttribute('placeholder');
    await input.fill(/URL/.test(placeholder)?'https://example.com/ui':`UI verified ${placeholder}`);
   }
   await form.getByRole('button',{name:'Save',exact:true}).click();
   await page.locator('.edit-notice.is-success').waitFor();
   assert.equal(await panel.locator('form').count(),1);
   console.log(`${section}: browser edit form submitted successfully.`);
  }
  await page.locator('.edit-hero-nav button').filter({hasText:/^taglines/i}).click();
  const tagline=page.locator('#taglines .drag-card').first();
  await tagline.locator('input').fill('Browser verified tagline');
  await tagline.getByRole('button',{name:'Save',exact:true}).click();
  await page.locator('.edit-notice.is-success').waitFor();
  assert.ok((await api('edit/taglines')).some(row=>row.text==='Browser verified tagline'));
  const orderBefore=(await api('edit/taglines')).map(row=>row.id);
  await tagline.getByRole('button',{name:'Move down'}).click();
  await page.getByText('Order updated.',{exact:true}).waitFor();
  const orderAfter=(await api('edit/taglines')).map(row=>row.id);
  assert.equal(orderAfter[1],orderBefore[0]);
  await page.locator('.edit-hero-nav button').filter({hasText:/^resume/i}).click();
  await page.getByLabel('Resume PDF').setInputFiles({name:'verified.pdf',mimeType:'application/pdf',buffer:pdf});
  await page.getByRole('button',{name:'Upload resume',exact:true}).click();
  await page.getByText('Resume updated.',{exact:true}).waitFor();
  await page.locator('.edit-hero-nav button').filter({hasText:/^site media/i}).click();
  for(const [label,button,notice] of [['Favicon image','Upload favicon','Favicon uploaded.'],['Social preview image','Upload social image','Social preview uploaded.']]) {
    await page.getByLabel(label,{exact:true}).setInputFiles({name:'verified.png',mimeType:'image/png',buffer:png});
    await page.getByRole('button',{name:button,exact:true}).click();
    await page.getByText(notice,{exact:true}).waitFor();
  }
  console.log('Tagline form, touch reorder buttons, resume form and both image forms passed.');
  const measurements=[];
  for(const width of [320,360,390,430,600,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   await page.reload();
   await page.locator('.edit-control-center').waitFor();
   await page.screenshot({path:`${out}/dashboard-${width}.png`,fullPage:true});
   for(const section of sections){
    const picker=page.getByLabel('Choose editor section');
    if(await picker.isVisible())await picker.selectOption(section);
    else await page.locator('.edit-hero-nav button').filter({hasText:new RegExp(`^${section==='site-media'?'Site media':section}`, 'i')}).click();
    await page.locator(`#${section}`).waitFor({state:'visible'});
    const metric=await page.locator('.edit-admin-shell').evaluate(el=>({left:el.getBoundingClientRect().left+parseFloat(getComputedStyle(el).paddingLeft),right:el.getBoundingClientRect().right-parseFloat(getComputedStyle(el).paddingRight),overflow:document.documentElement.scrollWidth>innerWidth,footerGap:document.documentElement.scrollHeight-(document.querySelector('.edit-site-footer').getBoundingClientRect().bottom+scrollY)}));
    assert.equal(metric.overflow,false,`${width} ${section} overflow`);
    if(await page.locator('.edit-admin-shell').evaluate(el=>el.scrollHeight>innerHeight))assert.ok(metric.footerGap<100,`${width} ${section}: footer gap ${metric.footerGap}`);
    const clipped=await page.locator(`#${section}`).evaluate(el=>[...el.querySelectorAll('input,textarea,button,select')].filter(x=>x.getClientRects().length).filter(x=>{const r=x.getBoundingClientRect();return r.left<0||r.right>innerWidth+1}).map(x=>x.outerHTML.slice(0,100)));
    assert.deepEqual(clipped,[],`${width} ${section} clipped controls`);
    if(['profile','projects','site-media'].includes(section))await page.screenshot({path:`${out}/${section}-${width}.png`,fullPage:true});
    measurements.push({width,section,...metric});
   }
   console.log(`${width}px: all 8 sections, mobile navigation, no overflow or clipped controls.`);
  }
  fs.writeFileSync(`${out}/measurements.json`,JSON.stringify(measurements,null,2));
  for(const item of await api('edit/achievements'))await api(`edit/achievements/${item.id}`,'DELETE');
  assert.deepEqual((await publicData()).achievements,[]);
  await page.goto(`${base}/home`);
  await page.waitForFunction(()=>document.querySelector('#achievements') && document.querySelectorAll('#achievements p').length===0);
  console.log('Deleting the last achievement leaves the public section empty, without restoring snapshot content.');
  assert.deepEqual(errors,[]);
  await api('admin/logout','POST');
  assert.equal((await context.request.get(`${base}/api/edit/profile`)).status(),401);
  console.log('Logout blocks editor access. No browser exceptions or unexpected HTTP 500 responses.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
