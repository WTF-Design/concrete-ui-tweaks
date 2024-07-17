// ==UserScript==
// @name        Concrete UI Tweaks
// @icon        data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 98 98'%3E%3Crect width='98' height='98' fill='%2319191A' rx='8'/%3E%3Cpath fill='%23FFF' d='M59 81.6a24.3 24.3 0 0 1-8.5 2.6c-8.4.7-16.8-1.5-22.6-7-5.7-6-6.9-14-1.7-20.6 4.8-6.2 12.6-8.8 20.7-9.1 4.5-.2 19.7 1.5 15.2 9-3.6 6-13.5 0-19.2 1.8-6.4 2.1-8.3 10.6-2.2 14.2a14.8 14.8 0 0 0 14.9-.4c6-4 17.1-22.1 24.4-13.5 1.4 1.8-15.5 20-21 23M16.8 34.2c-.6-3 .2-6.4 3.2-6 2.6.4 3.5 4 4 6.7.3 2.1 5.8 17.8 3 17.3-2.7-.6-9.6-14.9-10.2-18m14.4-17.5c4-3.4 6 2.4 6.4 5.3.4 2.8 5.5 24 .1 23.6-4.1-.3-6.9-18.3-7.2-21.1-.4-2.2-1.3-6.1.7-7.8m20.6-6c3.4.7 2.4 7.7 2.4 10.3 0 2.8.3 23.7-4 23-4.6-.6-3.5-21.3-3.7-24.6.1-3.4.6-9.6 5.3-8.7m10.4 15c.3-2 .8-6 3.2-6.9 4.7-1.8 4.6 4 4 6.8-.5 2.7-4.1 23.8-8.9 21.8-3.6-1.5 1-19 1.7-21.7'/%3E%3C/svg%3E
// @namespace   wtfdesign
// @include     *
// @grant       none
// @version     1.4.20240717
// @author      wtflm
// @description Concrete CMS Developer/Admin UI tweaks
// ==/UserScript==


// Show block type names in edit mode
const style = document.createElement(`style`);
style.textContent = `
	div.ccm-block-edit::after {
		content: attr(data-block-type-handle);
		color: #0002;
		font-size: small;
		position: absolute;
		transform: translateY(-50%);
		top: 1em;
		right: 32px;
	}

	#method-details :target {
		background-color: lightskyblue;
	}
	#method-details :target code {
		background-color: transparent;
	}
	:root:has(>body[data-name^="namespace:Concrete"]) {
		scroll-behavior: smooth;
	}
`;
document.head && document.head.appendChild(style);


// Show page type name in Composer
const composer = document.getElementById("ccm-panel-detail-page-composer");
if (composer) {
	let page_type = document.querySelector('.ccm-page').className.match(/page\-type(?:\-\w+)+/);
	page_type = page_type.replace(/^page\-type/, ""),
	page_type = page_type.replace("-", "_");
	composer.querySelector(`h3`).textContent += ` (${page_type})`;
}


// Show a login button
const site = document.querySelector(".ccm-page");
if (site && !site.classList.contains("is-logged-in")) {
	let CCM_APPLICATION_URL = window?.CCM_APPLICATION_URL ?? "";
	fetch(`${CCM_APPLICATION_URL}/index.php/login`)
	.then(response => response.text())
	.then(html => {
		const parser = new DOMParser();
		const loginPage = parser.parseFromString(html, "text/html");
		if (loginPage.querySelector(`form[action*="login/authenticate/concrete"]`)) {
			console.log("Concrete CMS login page found.");
			const loginLink = document.createElement("a");
			loginLink.innerHTML = `<img width="24" alt="Login" src="${GM.info.script.icon}"/>`;
			loginLink.href = `${CCM_APPLICATION_URL}/index.php/login`;
			loginLink.title = "Login";
			loginLink.style.position = "fixed";
			loginLink.style.inset = "3px 3px auto auto";
			loginLink.style.zIndex = "999";
			document.body.appendChild(loginLink);
		}
	});
}


// Path-specific features
const features = {
	"/community/forums/": {
		description: "Fix Archived forums code block reveal",
		enabled: true,
		code: function() {
			let links = document.querySelectorAll(`.code-block .code-link a`);
			if (!links.length) return false;
			console.log(links);
			links.forEach(el => {
				el.addEventListener("click", ev => {
					ev.target.parentElement.parentElement.nextElementSibling.style.removeProperty("display");
					ev.target.parentElement.parentElement.remove();
				});
			});
			return true;
		},
	},

	"/pages/types/output/": {
		description: "Open Page Type Defaults and Ouput entries in current view",
		enabled: true,
		code: function() {
			document.querySelectorAll(`a[target="_blank"]`).forEach(el => el.removeAttribute("target"));
			return true;
		},
	},

	"/reports/logs": {
		description: "Improve the legibility of var_dump_safe() dumps in Concrete CMS logs a bit",
		enabled: true,
		code: function() {
			logTable = document.querySelector(`table.ccm-search-results-table`);
			if (!logTable) return false;

			const style = document.createElement(`style`);
			style.textContent = `
				table.ccm-search-results-table td {
					vertical-align: top;
				}
				table.ccm-search-results-table pre {
					display: inline-block;
					font-size: smaller;
					vertical-align: text-top;
					transform: translateY(.125em);
				}
			`;
			document.head.appendChild(style);

			if (!logTable.tBodies[0].children.forEach) return false;
			logTable.tBodies[0].children.forEach(tr => {
				tr.children.forEach(td => {
					if (!/(?=(object\(|array\(\d+\) \{))/.test(td.textContent)) return false;
					td.innerHTML = td.innerHTML.trim();
					td.innerHTML = td.innerHTML.replace(/\<br\/?>/g, "");
					td.innerHTML = td.innerHTML.replace(/(?=(object\(|array\(\d+\) \{))/g, `<pre>`);
					td.innerHTML = td.innerHTML.replace(/(?:.)(?=<pre>)/g, `<br/>`);
					td.innerHTML = td.innerHTML.replace(/\=&gt;\n  /g, ` => `);
					td.innerHTML = td.innerHTML.replace(/(?<=\})/g, "</pre><br/>");
				});
			});
			return true;
		},
	},

	"/system/multilingual/translate_interface/translate_po/": {
		description: "Make the Translate Site Interface Original String field more easily copyable",
		enabled: true,
		code: function() {
			function fetchTranslation(ev) {
				if (!window.ccmgtwin) {
					ev.preventDefault();
					window.ccmgtwin = window.open(ev.target.href, "ccmgtwin", "popup,width=720,height=720");
				}

			}
			const interface = document.getElementById("ccm-translator-interface");
			let mo = new MutationObserver(() => {
				mo.disconnect();
				let translations = document.querySelector(`.ccm-translator-col-original`);
				let original;
				let gtLink;
				let dirty = document.querySelector(`#ccm-dashboard-content-regular script`);
				if (!dirty) return false;
				let offset = dirty.textContent.search(/export_translations\\\//);
				let targetLanguage = dirty.textContent.slice(offset).match(/(?<=\\\/)\w\w/);
				translations.addEventListener("click", ev => {
					original = document.querySelector(`.ccm-translator-original`);
					if (!original) return false;
					let input = document.createElement("input");
					input.type = "text";
					input.readonly = true;
					input.value = original.textContent.trim()
					input.className = "form-control";
					original.parentElement.appendChild(input);
					gtLink = document.createElement("a");
					gtLink.style.float = "right";
					gtLink.textContent = "Google";
					gtLink.target = "ccmgtwin";
					gtLink.href = `https://translate.google.com/?sl=en&tl=${targetLanguage}&text=${input.value}&op=translate`;
					gtLink.addEventListener("click", fetchTranslation);
					let hoaa = original.parentElement.parentElement.querySelector(`.form-group:last-of-type`);
					hoaa.appendChild(gtLink);
					original.remove();

				});
			});
			mo.observe(interface, {childList:true});
			return true;
		},
	},

	"/account/edit_profile": {
		description: "Restore profile page field values after password manager auto-fill",
		enabled: true,
		code: function() {
			setTimeout(() => {
				document.activeElement.blur();
				addEventListener("keydown", ev => {
					if (ev.key == "Tab") {
						ev.preventDefault();
						document.querySelector(`[tabindex="1"]`).focus();
					}
				}, {once: true});
			}, 1000);
			[
				"uName",
				"uEmail",
				"uPasswordCurrent",
				"uPasswordNew",
				"uPasswordNewConfirm",
			].forEach(id => {
				let field = document.getElementById(id);
				setTimeout(() => field.value = field.getAttribute("value"), 1500);
			});
		},
	},

	"/9-x/developers/": {
		description: "Concrete 9.x developer documentation TOC polish",
		enabled: true,
		code: function() {
			let style = document.createElement("style");
			style.textContent = `
				#toc > .toc-list::before {
					content: "Table of Contents";
					display: block;
					padding: 8px;
				}
				.toc-list {
					padding: 0 8px 8px 8px;
					font-size: inherit;
					font-weight: 600;
					li {
						padding-left: 2ch;
						a {
							padding-left: 0;
							&:hover {
								text-decoration: underline;
							}
							&::before {
								content: none;
							}
						}
					}
				}
			`;
			document.head.appendChild(style);
		},
	},
};


// The dispatcher
Object.keys(features).find(key =>
	features[key].enabled
	&& new RegExp(key).test(location.pathname)
	&& features[key].code()
	&& console.log(`${GM.info.script.name}: ${key} UserScript run.`)
);
