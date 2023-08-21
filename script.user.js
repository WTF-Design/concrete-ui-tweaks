// ==UserScript==
// @name        Concrete UI Tweaks
// @namespace   wtflm
// @include     *
// @grant       none
// @version     1.1.20230821
// @author      wtflm
// @description Concrete CMS Admin UI tweaks
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
			loginLink.innerHTML = `<img width="24" alt="Login" src="${CCM_APPLICATION_URL}/concrete/images/logo.svg"/>`;
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
};


// The dispatcher
Object.keys(features).find(key =>
	features[key].enabled
	&& new RegExp(key).test(location.pathname)
	&& features[key].code()
	&& console.log(`${GM.info.script.name}: ${key} UserScript run.`)
);
