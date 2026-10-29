#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const root=path.resolve(__dirname,'..');
const appHTML=path.resolve(process.env.APP_HTML||path.join(root,'index.html'));

async function main(){
 const browser=await firefox.launch({headless:true,...(process.env.FIREFOX_EXECUTABLE?{executablePath:process.env.FIREFOX_EXECUTABLE}:{})});
 try{
  async function open(){
   const context=await browser.newContext({viewport:{width:390,height:844}});
   await context.route(/^https?:/,route=>route.abort());
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(pathToFileURL(appHTML).href);
   await page.waitForSelector('#setup-next');
   await page.evaluate(()=>AccessAdelaide.setSettings({textSize:'100',theme:'light',targets:false}));
   await page.locator('#setup-next').click();
   await page.waitForSelector('[data-need][value="seeing"]');
   return {context,page,errors};
  }
  async function finishTools(page){
   await page.locator('#setup-next').click();
   await page.waitForSelector('[data-setup-tool="read"]');
  }
  async function complete(page){
   await page.locator('#setup-done').click();
   await page.waitForSelector('#view-explore:not([hidden])');
  }

  // Vision support supplies visual adjustments and text controls, without
  // choosing spoken screens or the Read page shortcut.
  {
   const {context,page,errors}=await open();
   await page.locator('[data-need][value="seeing"]').check();
   assert.equal(await page.locator('[data-dock-tool="text"]').isVisible(),true);
   assert.equal(await page.locator('[data-dock-tool="read"]').count(),0);
   assert.deepEqual(await page.evaluate(()=>{const s=AccessAdelaide.getSettings();return {textSize:s.textSize,theme:s.theme,targets:s.targets};}),{textSize:'150',theme:'contrast',targets:true});
   await finishTools(page);
   assert.equal(await page.locator('[data-setup-tool="text"]').isChecked(),true);
   assert.equal(await page.locator('[data-setup-tool="read"]').isChecked(),false);
   assert.equal(await page.locator('#setup-speech input[value="ask"]').isChecked(),true);
   await complete(page);
   assert.equal(await page.locator('[data-dock-tool="text"]').isVisible(),true);
   assert.equal(await page.locator('[data-dock-tool="read"]').count(),0);
   assert.equal(await page.locator('#voice-start').isVisible(),false);
   assert.deepEqual(errors,[]);await context.close();
  }

  // Reading aloud still selects the reader and spoken screens, including
  // when it is combined with the separate vision preference.
  for(const seeing of [false,true]){
   const {context,page,errors}=await open();
   if(seeing)await page.locator('[data-need][value="seeing"]').check();
   await page.locator('[data-need][value="reading"]').check();
   assert.equal(await page.locator('[data-dock-tool="read"]').isVisible(),true);
   await finishTools(page);
   assert.equal(await page.locator('[data-setup-tool="read"]').isChecked(),true);
   assert.equal(await page.locator('#setup-speech input[value="screens"]').isChecked(),true);
   await complete(page);
   assert.equal(await page.locator('[data-dock-tool="read"]').isVisible(),true);
   assert.deepEqual(errors,[]);await context.close();
  }

  // Removing the reading preference removes its suggestion; the user can
  // still explicitly enable spoken screens and have the reader added.
  {
   const {context,page,errors}=await open();
   await page.locator('[data-need][value="seeing"]').check();
   await page.locator('[data-need][value="reading"]').check();
   await page.locator('[data-need][value="reading"]').uncheck();
   assert.equal(await page.locator('[data-dock-tool="read"]').count(),0);
   await finishTools(page);
   assert.equal(await page.locator('[data-setup-tool="read"]').isChecked(),false);
   await page.locator('#setup-speech input[value="screens"]').check();
   assert.equal(await page.locator('[data-setup-tool="read"]').isChecked(),true);
   await complete(page);
   assert.equal(await page.locator('[data-dock-tool="read"]').isVisible(),true);
   assert.deepEqual(errors,[]);await context.close();
  }
  console.log('PASS setup needs: vision and reading suggestions are independent; combined, deselected and explicit spoken-screen choices work.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
