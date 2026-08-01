/** Runs before paint to avoid landing/store theme flash (FOUC). */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var p=location.pathname;var t=p.indexOf("/store")===0?"store":"landing";document.documentElement.setAttribute("data-theme",t);document.documentElement.classList.remove("dark");}catch(e){}})();`;
