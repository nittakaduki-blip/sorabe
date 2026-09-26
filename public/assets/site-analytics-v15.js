(()=>{
  const id=document.querySelector('meta[name="google-analytics-id"]')?.content?.trim();
  window.dataLayer=window.dataLayer||[];
  window.sorabeTrack=(event,parameters={})=>{window.dataLayer.push({event,...parameters});if(typeof window.gtag==='function')window.gtag('event',event,parameters)};
  document.addEventListener('click',event=>{const target=event.target.closest('[data-track]');if(target)window.sorabeTrack(target.dataset.track,{link_url:target.href||'',link_text:target.textContent.trim().slice(0,80)})});
  if(!/^G-[A-Z0-9]+$/i.test(id||''))return;
  const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;document.head.append(script);
  window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',id,{anonymize_ip:true});
})();
