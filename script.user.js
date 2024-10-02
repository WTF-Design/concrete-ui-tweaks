// ==UserScript==
// @name        WTF Concrete UI Tweaks
// @icon        data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 16 16'%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='.25' y1='-.1' x2='0' y2='.5'%3E%3Cstop stop-color='%23F7B535' offset='0%25'/%3E%3Cstop stop-color='%23E61D72' offset='100%25'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='8' cy='8' r='8' fill='url(%23gradient)'/%3E%3Cpath stroke-width='.1' stroke='%23fff' fill='%23fff' d='M8.17 9.73q-.31.36-.77.57-.45.2-1.05.2-.54 0-1-.17-.46-.18-.8-.5-.33-.34-.52-.8-.2-.45-.2-1 0-.56.2-1.01.2-.46.54-.78t.8-.5q.47-.17 1-.17.5 0 .97.18.49.17.78.51l-.76.77q-.16-.22-.42-.33-.26-.1-.53-.1-.3 0-.55.11-.24.1-.42.3-.18.2-.28.45-.1.26-.1.57 0 .32.1.59.1.26.27.45.18.19.43.3.24.1.53.1.34 0 .6-.13.24-.14.4-.35l.78.74zm3.85-.9q0 .43-.15.75-.16.31-.41.52-.26.2-.58.3-.32.1-.67.1-.31 0-.6-.08t-.54-.23q-.23-.15-.4-.37-.17-.23-.25-.5l1.02-.31q.07.24.27.4.2.16.48.16.28 0 .49-.17.21-.18.21-.51 0-.2-.09-.35-.08-.14-.22-.22-.13-.08-.3-.11-.18-.04-.35-.04-.25 0-.57.06-.32.05-.57.15L8.9 5.7h2.87v.95H9.9l-.04.74.23-.03.24-.01q.35 0 .66.09.3.1.53.28.23.19.37.47.13.27.13.64z' aria-label='C5'/%3E%3C/svg%3E
// @namespace   wtfdesign
// @include     *
// @grant       none
// @version     1.10.1
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
if (window.hasOwnProperty("CCM_APPLICATION_URL") && !(window.CCM_USER_REGISTERED ?? document.documentElement.classList.contains("ccm-toolbar-visible"))) {
	(function() {
		// Check whether we're already on a login page.
		if (/\/login/.test(location.pathname)) return false;

		fetch(`${CCM_APPLICATION_URL}/index.php/login`)
		.then(response => response.text())
		.then(html => {
			console.log("Concrete CMS login page found.");

			const parser = new DOMParser();
			const loginPage = parser.parseFromString(html, "text/html");

			const loginIcon = `
				<svg fill="#fff" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
					<defs>
						<style>
							@keyframes inee {
								33.333% {
									translate: 60% 0;
									animation-timing-function: step-start;
								}
								66.667% {
									translate: -60% 0;
								}
							}
							.loginLink g path {
								animation: inee 1s linear infinite;
								animation-play-state: paused;
							}
						</style>
					</defs>
					<clipPath id="clip">
						<path d="M120-760h560v560H120z"/>
					</clipPath>
					<g clip-path="url(#clip)">
						<path d="m400-280-55-58 102-102H120v-80h327L345-622l55-58 200 200z"/>
					</g>
					<path d="M480-120v-80h280v-560H480v-80h280q33 0 57 24 23 23 23 56v560q0 33-23 57-24 23-57 23Z"/>
				</svg>
			`;

			const loginLink = document.createElement("a");
			loginLink.className = "loginLink";
			loginLink.innerHTML = loginIcon;
			loginLink.href = `${CCM_APPLICATION_URL}/index.php/login`;
			loginLink.title = "Login";
			Object.assign(loginLink.style, {
				width: "24px",
				height: "24px",
				position: "fixed",
				inset: "3px 3px auto auto",
				zIndex: "9999",
				mixBlendMode: "difference",
			});
			document.body.appendChild(loginLink);
			let arrow = loginLink.querySelector(`g path`);
			loginLink.addEventListener("mouseenter", () => arrow.style.animationPlayState = "running");
			loginLink.addEventListener("mouseleave", () => {
				arrow.addEventListener("animationiteration", ev => {
					if (!loginLink.matches(`:hover`)) arrow.style.animationPlayState = "paused";
				});
			}, {once: true});
		});
	})();
}


// Activate stack frame file names as links to copy their path to the clipboard in an editor friendly format
if (document.title == "Concrete CMS has encountered an issue.") {
	let style = document.createElement("style");
	style.textContent = `
		.copy {
			cursor: pointer;
			transition: filter .2s;
			position: relative;
			display: inline-block;
			&, .delimiter {
				text-decoration: underline dotted;
			}
			&::after {
				text-decoration: none;
				content: "";
				display: block;
				position: absolute;
				right: 0;
				top: 50%;
				translate: 1.25em -50%;
				width: 1em;
				height: 1em;
				background-color: currentcolor;
				mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M208 0h124.1A48 48 0 0 1 366 14.1L433.9 82a48 48 0 0 1 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64v256h192v-32h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z'/%3E%3C/svg%3E");
				mask-repeat: no-repeat;
			}
			&.copied {
				filter: brightness(2);
				transition-duration: 0s;
			}
		}
	`;
	document.head.appendChild(style);
	document.querySelectorAll(`.frame-file`).forEach(el => {
		if (el.textContent.trim() == "Arguments") return false;
		el.classList.add("copy");
		el.addEventListener("click", ev => {
			el.classList.add("copied");
			navigator.clipboard.writeText(el.textContent.trim().replace(/^…?\/(?:app\/)?(.+)/u, "$1").replace(/\d+$/, ""));
			setTimeout(() => el.classList.remove("copied"), 200);
		});
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
				/* ${GM.info.script.name}: ${this.description} */
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
				/* ${GM.info.script.name}: ${this.description} */
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

	"/dashboard/extend/update": {
		description: "Make Add-On changelogs less loud",
		enabled: true,
		code: function() {
			let style = document.createElement("style");
			style.textContent = `
				/* ${GM.info.script.name}: ${this.description} */
				.ccm-marketplace-update-changelog {
					h1 {
						font-size: 2em;
					}
					h2 {
						font-size: 1.5em;
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
