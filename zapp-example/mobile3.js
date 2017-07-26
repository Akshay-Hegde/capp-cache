

//! Source: javascripts/new/UiControl.js

try{
	;(function() {
		Capriza.Views = {};

		Capriza.Views.createView = function(model, page, viewGetter, defaultView) {
			if (!model) return;

			viewGetter || (viewGetter = Capriza.Views.getViewByModel);
			var viewClass = viewGetter(model), newView;

			if (viewClass) {
				newView = new viewClass({ model: model, page: page });
			} else {
				newView = new (defaultView || Capriza.Views.UiControl)({ model: model, page: page });
			}

			Dispatcher.trigger("uiControl/created", newView);
			return newView;
		};

		Capriza.Views.validateDomReadyForModal = function(shouldAddDummyPageInDesigner){
			$from = $(".active.page");
			if (shouldAddDummyPageInDesigner || !$from.length || ["pagecontext-not-found","start-page"].indexOf($from[0].id) > -1){
				Utils.addDummyPage();
			}
			var $shield = Utils.raiseModalShield(),
			    $modalContainer = Utils.raiseModalContainer();
			Utils.moveShieldBeforeElement($shield, $modalContainer);
			return $shield.length && $modalContainer.length && $(".active.page").length;
		};

		Capriza.Views.preparePageModal = function($page, options){
			$from = $(".active.page");
			var shouldAddDummyPageInDesigner = ((window.isDesignerPreview || window.designerLoaded) && ($from.attr("uniqueId") == $page.attr("uniqueId") && (!$from.attr("id") || $from.attr("id").indexOf("drill") == -1)) && !options.modalToModal);
			Capriza.Views.validateDomReadyForModal(shouldAddDummyPageInDesigner);
			$page.appendTo(".modal-page-container");
			return $page.addClass("page-modal");
		};

		Capriza.Views.initWidget = function(widgetName, obj) {
			Capriza.Model.Control.createApi(widgetName, obj.displayType);
			return $.widget("capriza." + widgetName, obj);
		};


		Capriza.Views.applyStyleFromString = function(el, styleStr, inheritedProps, model) {

			/**
			 * NOTE: optional performance hit - going over props and for each prop visiting all the children, instead of vice versa
			 * When this really hurts us we should take care of this.
			 */

			_.each(styleStr.split(";"), function(prop) {
				if(!prop) {
					return;
				}
				var index = prop.indexOf(":"), name = prop.substr(0, index), value = prop.substr(index + 1);
				$(el).css(name, value);

				if (inheritedProps && inheritedProps.indexOf(name) >= 0) {
					$("*", el).each(function() {
						$(this).css(name, "inherit");
					});
				}
			});
		};

		Capriza.Views.UiControl = Backbone.View.extend({
			render: function() {
				Logger.trace("UiControl.render: " + this.model.get("id")+' type: '+this.model.get("type"));

				_.bindAll(this, "blockEvents");

				this.$el = this._render();
				if(!this.$el) return null;
				this.$el
					.addClass("ui-control")
					.addClass(this.model.get("mcClass"))
					.data("uicontrol", this)
					.attr("data-mc", this.model.get("id"))
					.attr("data-mctemplid", this.model.get("mcTemplId"));

				this.setKey(this.model.get("key"));

				Dispatcher.trigger("uiControl/rendered", this);

				this.post();
				return this.$el;
			},

			_renderHendelbars: function(){
				var template = Handlebars.templates[this.template];
				this.presentationModel = this.getPresentationModel();
				this.$el = $(template(this.presentationModel));
				return this.$el;
			},

			_render: function(){},

			post: function() {

				this._post();
				this.applyMcSize();
				this.setMcStyle();
				this.setStyleSets();
				this.setShouldUseWebColor();
				this.setIsDisabled();
				this.setError();
				this.setTooltip();
				this.disablePropagation();
			},

			setKey: function(key) {
				var hasKey = (typeof key === "string");
				if (this.$label) {
					if (hasKey) this.$label.text(key);
					else {
						this.$label.remove();
						this.$label = null;
					}
				} else if (hasKey) {
					this.$label = $("<label>").text(key).attr("for", this.labelFor() || "").attr("id", this.labelId() || "").prependTo(this.$el);
				}
			},

			labelFor: function() {
				return this.getUniqueControlId() + "input";
			},

			labelId: function() {
				return this.getUniqueControlId() + "label";
			},

			disablePropagation: function() {},

			setMissing:function(){
				var missing = this.model.get("missing");
				var self = this;
				if(missing){
					this.removeFromPage();
					this.destroy();
				}
				else{//TODO: relevant for view reuse in _updateState
					delete this.destroyed;
				}
			},

			//stub to handle isReadOnly Control updates
			setIsReadOnly: function(){
				if (this.model.get("isReadOnly")) {
					this.$el.addClass("readonly");
					this.$el.find("input,textarea").prop({readOnly: true, tabIndex: -1});
				} else if (this.model.get("isReadOnly") === false) {
					this.$el.removeClass("readonly");
					this.$el.find("input,textarea").prop({readOnly: false, tabIndex: 0});
				}
			},

			renderOutsideEl: function(container) {//container is the same one used in the mobile schema definition
				var prefix = "ss-"+container+"-";
				var outerEl = $("<div>");
				if(this.model.get("styleSetIds")) outerEl.addClass(prefix + this.model.get("styleSetIds").join(" "+prefix));
				return outerEl.attr("data-"+container+"-mc", this.model.get("id")).appendTo(".viewport");
			},

			setTooltip: function(tooltip) {
				this.$el.attr("title", tooltip || this.model.get('tooltip'));
			},

			setIsDisabled: function () {
				if (this.model.get("isDisabled")) {

					if (this.model.get('disableOpts') === 'hidden') {
						this.$el.addClass('hidden');
					}
					else {
						this.$el.addClass("disabled");
						this.$el[0].addEventListener('click', this.blockEvents, true);
						this.$el[0].addEventListener('focus', this.blockEvents, true);
						this.$el.find("input,textarea,radio,select").prop("disabled", true);
					}

				} else if (this.model.get("isDisabled")===false || this.model.get("isDisabled")===null) {
					if (this.model.get('disableOpts') === 'hidden') {
						this.$el.removeClass('hidden');
					}
					this.$el.removeClass("disabled");
					this.$el.find("input,textarea,radio,button,select").prop("disabled", false);
					this.$el[0].removeEventListener('click', this.blockEvents, true);
					this.$el[0].removeEventListener('focus', this.blockEvents, true);
				}

				Dispatcher.trigger("uiControl/isDisabled/change", this);
			},

			blockEvents: function(e){
				if (this.shouldAllowClickWhenDisabled && this.shouldAllowClickWhenDisabled({event: e})) return;
				this.$el.find("button").prop("disabled", true);
				e.preventDefault();
				e.stopPropagation();
				Logger.info("user interacted with control '" + this.model.get('id') + "' of type '" + this.model.get('type') + "' while BLOCKED. event: " + e.eventType);
				Dispatcher.trigger("app/disabledControlInteracted", this);
			},

			setError: function() {
				var error = this.model.get('error');

				if (error) {
					this.$el.addClass('error');

					if (!this.$error) {
						this.$error = $("<div class='error-text-container'><div class='error-message'></div></div>").insertAfter(this.$el.find("input,textarea,.selected-content"));
						this.$errorLine = $('<div class="error-line"></div>').insertBefore(this.$el.find(".error-text-container"));
					}

					var self = this;

					if ((typeof error === "string")) {
						this.$error.find('.error-message').text(error);

						setTimeout(function() {

							var errorMessage = self.$error.find('.error-message');
							var errorMessageHeight = errorMessage.css('height');
							errorMessage.css('transform', 'translate3d(0, -'+errorMessageHeight+', 0)');

							setTimeout(function() {
								self.$errorLine.addClass('active');
								self.moveAllNextElementDown(self.$el, parseInt(errorMessageHeight), '0.3s', true);
								self.$error.css('height', '100%');
								errorMessage.css('transition', 'transform, 0.3s, cubic-bezier(0.4,0,0.2,1)');
								errorMessage.css('transform', 'translate3d(0, 0, 0)');
								Dispatcher.trigger("automation/control/error");
							}, 50);
						},0);
					}
					else {
						setTimeout(function() {
							self.$errorLine.addClass('active');
							Dispatcher.trigger("automation/control/error");
						}, 0);

					}


				}
				else {
					this.$el.removeClass('error');
					if (this.$error) {
						this.$error.on('');
						this.$error.remove();
						this.$error = null;
					}
					if (this.$errorLine) {
						this.$errorLine.remove();
						this.$errorLine = null;
					}
					Dispatcher.trigger("automation/control/error");
				}

			},

			setStyleSets: function() {
				this.$el.addClass("ss-dss_global");
				if (this.model.get("styleSetIds")) this.$el.addClass("ss-" + this.model.get("styleSetIds").join(" ss-"));
			},

			setShouldUseWebColor: function() {
				if (this.model.get("shouldUseWebColor")) {
					var style = this.model.get("style");
					style && this.$el.css(style);
				}
			},


			setMcStyle: function(mcStyleParam) {
				var mcStyle  = mcStyleParam || this.model.get("mcStyle");
				mcStyle && typeof mcStyle === 'string' && this.applyStyleFromString(this.$el, mcStyle);
			},

			_post: function(){},

			destroy: function() {
				// nothing right now, need to fill this later
				//Logger.info("destroy for "+this.model.get("id")+" of type "+this.model.get("type"));
				this.destroyed = true;
				if(this._destroy) this._destroy();
				Dispatcher.off(null,null,this); // remove all listeners with the uiControl as context
			},

			applyMcSize: function(){

				if (this.model.get("mcSize")) {

					this.$el.css({width: this.model.get("mcSize").width});
				}
			},

			getPresentationModel : function() {
				return this.model.toJSON();
			},

			getUniqueControlId: function() {
				return this.options.page.getPageId().concat(this.model.get("id"));
			},

			/**
			 * Sorts the attributes prior to setting them. sometimes an attribute must be set before
			 * another (e.g. in Listbox items must be set before selectedIndex
			 * @param attributes
			 * @returns {*}
			 */
			sortAttributes: function(attributes) {

				if (!this.attributesUpdateOrder) return attributes;

				var self = this;

				//verify that all attributes exist in the updatesOrder
				_.keys(attributes).forEach(function(keyAttr) {
					if (self.attributesUpdateOrder.indexOf(keyAttr) < 0) {
						Logger.warn("attribute key "+keyAttr+' is not defined in the ordered attributes list');
					}
				});


				var sortedKeys = this.attributesUpdateOrder.filter(function(attr) {
					return _.keys(attributes).indexOf(attr) > -1;
				});

				var unsortedKeys = _.keys(attributes).filter(function(attr) {
					return self.attributesUpdateOrder.indexOf(attr) < 0 ;
				});

				var result = {};

				sortedKeys.forEach(function(key) {
					result[key] = attributes[key];
				});
				unsortedKeys.forEach(function(key) {
					result[key] = attributes[key];
				});

				return result;
			},

			update: function(attributes) {

				// don't update the element if it no longer exists in the DOM
				if (!this.existsInDOM() || this.destroyed) return;

				// notifications has no el currently because it's not a 'real' view, will be removed once modeled as a bubble
				if(this.$el) this.$el.prop("lastUpdated", Date.now());
				this._callSetters(attributes);
			},

			_callSetters: function(attributes){
				for (var p in attributes) {
					var setter = this["set".concat(p.capitalize())];
					setter && setter.call(this, attributes[p]);
				}
			},

			applyStyleFromString: function(el, styleStr) {
				Capriza.Views.applyStyleFromString(el, styleStr, this.inheritedProps, this.model);
			},

			applyStyleFromObject: function() {
				Capriza.Views.Utils.applyStyleOnElement(this.$el, this.model.get("style"));
			},

			setCss: function(el, name, value) {
				$(el).css(name, value);
			},

			setValidationMessage: function(msg) {

				var possibleOldError = this.$el.next();
				if (possibleOldError.hasClass('validation-message')) {
					$(possibleOldError).remove();
				}
				msg = msg || "";
				var $msg = $("<div class='validation-message'></div>").text(msg);
				this.$el.after($msg);
				this.$el.css({ marginBottom: "4px" });
			},

			removeFromPage: function() {
				var $el = this.getRepEl(), self = this;
				Dispatcher.trigger("control/remove/before", this);
				if ((window.isDesignerPreview || window.designerLoaded) && Capriza.Views.usePageUpdateAnimation) {
					$el.addClass("animated fadeOutRight");
					$el.on("animationend webkitAnimationEnd", function() {
						self.removeEl.call(self, $el);
					});
				} else {
					this.removeEl.call(this, $el);
				}

			},

			removeEl: function($el){
				$el.remove();
				// TODO: merge these triggers to one with event bubbling
				Dispatcher.trigger("control/remove/after", self);
				this.trigger("control/remove/after");
			},

			getRepEl: function() {
				return this.$el;
			},

			replaceWith: function(otherView) {
				otherView.setReplacedAdditionalValues(this.getReplacedAdditionalValues());
				this.$el.replaceWith(otherView.render());
			},
			getReplacedAdditionalValues:function(){},
			setReplacedAdditionalValues:function(){},

			saveToPageState: function(key, val){
				var modelId = this.model.get('mcTemplId') || this.model.get("id"),
				    page = this.options.page;

				if (page.model.get('type') === 'drillPage') page = page.model.get('parentPage');
				if(!page.state) page.state = {};
				if(!page.state[modelId]) page.state[modelId] = {};
				page.state[modelId][key] = val;
			},

			loadFromPageState: function(key){
				var modelId = this.model.get('mcTemplId') || this.model.get("id"),
				    page = this.options.page;

				if (page.model.get('type') === 'drillPage') page = page.model.get('parentPage');
				return page.state && page.state[modelId] && page.state[modelId][key];
			},

			existsInDOM: function() {
				if(this.isInBubble(this.model.parent)) { // If this control is contained inside a bubble we want to act as if it always exist in DOM
					return true;
				} else {
					return document.getElementById(this.getUniqueControlId());
				}
			},

			isInBubble : function(parent) {
				if(parent){
					if(parent.get('panelType') && (parent.get('panelType') == 'bubble')){
						return true;
					} else {
						return this.isInBubble(parent.parent);
					}
				}else {
					return false;
				}
			},

			getClosestScrollingContainer: function(retrieveAll){
				var closestScrollingArea = this.$el.closest(".active " + (retrieveAll ? "" : ".panel-type-main>") + ".scrolling-area, .active .tab-content.active");
				return closestScrollingArea.length ? closestScrollingArea : $(".active " + (retrieveAll ? "" : ".panel-type-main>") + ".scrolling-area, .active .tab-content.active");
			},

			hasExtraData: function(prop) {
				return this.model.get("extraData") && this.model.get("extraData")[prop];
			},

			isOverflowed: function() {
				var thisTop = this.el.getBoundingClientRect().top;
				var viewportBottom = $('.viewport')[0].getBoundingClientRect().bottom;
				return thisTop > viewportBottom;
			},

			enableScrollingPropagation : function() {
				if ( Capriza.device.android){
					//this.getScrollingContainer().css("overflow-y", "auto");
					this.getClosestScrollingContainer().css("overflow-y", "auto");
				}
			},

			disableScrollingPropagation : function() {
				if ( Capriza.device.android){
					//this.getScrollingContainer().css("overflow-y", "hidden");
					this.getClosestScrollingContainer().css("overflow-y", "hidden");
				}

			},
			moveAllNextElementDown: function(currentObj, height, time, useTransition, alreadyOpen){
				while((currentObj = currentObj.next()).length ){
					var actual3d = height;
					if (!alreadyOpen){
						actual3d = parseInt(currentObj.attr("height3d")) || 0;
						actual3d += height;
					}
					var objZIndex = parseInt(currentObj.css("z-index"));
					currentObj.css({
						"transition" :  useTransition ? "transform "+ time+" cubic-bezier(.21,.72,.71,.96)" : "",//0,0,0.25,1)",
						"transform" : "translate3d(0, "+ actual3d +"px,0)",
						"z-index" : "1",
						"top" : "-"+ actual3d +"px",
						"position": "relative"
					});

					currentObj.attr("height3d", actual3d );
					!alreadyOpen && objZIndex && currentObj.attr({"originalZIndex" : objZIndex});
				}
			},
			moveAllNextElementUp: function(currentObj, height, time, pageJumpGap){
				while((currentObj = currentObj.next()).length ){
					var actual3d = parseInt(currentObj.attr("height3d")) || 0;
					actual3d -= height;
					actual3d = Math.max(actual3d, 0);
					var finalTransform = actual3d + pageJumpGap == 0 ? "none" : "translate3d(0,  "+ (actual3d + pageJumpGap) +"px,0)";
					currentObj.css({
						"transition" : "transform "+ time +" cubic-bezier(.21,.72,.71,.96)",
						"transform" : finalTransform
					});
					currentObj.attr("height3d",actual3d);
					currentObj.on(Utils.transitionEnd, function(){
						var this3d = parseInt($(this).attr("height3d")) || 0;
						this3d = Math.max(this3d, 0);
						var actualZIndex = $(this).attr("originalZIndex") || "";
						$(this).css({"top": " -" + this3d + "px",
							"transition": "none",
							"z-index" : actualZIndex
						});
						!this3d && $(this).css({"position": ""});
						$(this).off(Utils.transitionEnd);
					});
				}
			},
			//BlockingControl methods:

			//Notifies the page that this control is now blocking the page (e.g. the bubble is shown, and blocks other page interactions)
			notifyBlockPage: function(){
				this.options.page && this.options.page.addBlockingControl(this);
			},
			//this method is meant to be overridden by the respectful uiControl (e.g. bubble should implement it as "hideBubble")
			unblockPage: function(){
				this.options.page && this.options.page.removeBlockingControl(this);
			},

			reportInteraction: function(interactionData){
				if (!debug || !debug.interactions) return;
				var controlPath = document.activeElement.id;
				if (!controlPath){
					controlPath = this.$el.prop("id");
					if (document.activeElement.classList && document.activeElement.classList.length){
						controlPath += " ." +document.activeElement.classList.toString().replace(/\s/g, ".");
					}
				}
				if (controlPath){
					controlPath = "#"+controlPath;
				}
				interactionData = _.extend({
					element: "mc",
					elementId: this.model.get("id"),
					interaction: "general",
					controlPath: controlPath
				}, interactionData);
				Logger.debug("[LogUserInteractions] a user interaction detected");
				Utils.reportInteraction(interactionData);
				//if (interactionData){
				//    Logger.debug("[LogUserInteractions] target class are: "+ interactionData.interaction);
				//    debug.interactions.push(interactionData);
				//
			},

			inheritedProps: ["color", "font-style", "font-weight", "line-height", "text-decoration"]
		});

		Capriza.Views.Utils = {

			wrapLinkWithPropagation: function(link) {
				var $aEl = $(link);
				$aEl.on("click", function(e) {
					e.stopPropagation();
				});
				return $aEl[0];
			},

			// overide.js
			addTelephoneLinks: function (html, controlAction) {
				if (!html) return html;

				// in desktop we want the target to open in new tab and not override the mobile tab
				var aTarget = Capriza.device.isDesktop ? "<a target='_blank'" : "<a target='_top'";

				if (!controlAction || controlAction === 'none') {
					return html.toString().replace(/<a\s+href=(.*?)>.*?/gi, '');
				}

				var ret = html.toString();
				//Detect inline mailto or tel link, there shouldn't be the target='_top' attribute (the copy element in htmlfrag removes it)
				ret = ret.replace(/<a(.*?(["']mailto|['"]tel).*?)>/g, aTarget+"$1>");

				//Detect phone number only and replace with mobile tel link
				// within inner text content (/>([^><]*?)</g)
				//   replace only phone numbers
				//adding the ">" before and "<" after to simulate that the html is a inner content of div
				// (\+?((\(\d{2,5}\))|\d+)?[-\s]?\d+([-\s])*\d{3,9}(-\d+)*)|[\*\+]\d{3,10}\b alternative regex to detect all phone numbers
				ret = ">"+ret+"<";
				ret = ret.replace(/>([^><]*?)</g, function (match) {
					return match.replace(/\+?((\(\d{2,5}\))|\d+)?[-\s]?\d+[-\s]\d{3,9}(-\d+)*\b/g, aTarget+" class='telephone' href='tel:$&'>$&</a>");
					//return match.replace(/((\+?((\(\d{2,5}\))|\d+)?[-\s]?\d+([-\s]\d{3,9})+(-\d+)*)|((\(\d{2,5}\))+[-\s\+]\d{2,10})|\b([^\D]\d{5,10}))\b/g, aTarget+" class='telephone' href='tel:$&'>$&</a>");
				});

				return ret.substring(1,ret.length-1);
			},

			buildMiniBrowser: function(href, extraActions){
				function miniBrowserLoaded(){
					clearTimeout(miniBrowserError);
					miniBrowser.off("load", miniBrowserLoaded);
					Utils.hideUnimessages();
					setTimeout(function() {
						Dispatcher.trigger("miniBrowser/loaded");
					},16);
				}

				miniBrowser.attr("src", href);
				var $pageMiniBrowser = $(".page.mini-browser");

				Utils.showUnimessage({type: "progress"});

				var miniBrowserError = setTimeout(function () {
					Utils.updateUnimessage({type: "error", messageText: "Failed to open link. Try to open in external browser or go back to the Zapp."}, false, false, true);
				}, 15000);
				miniBrowser.on("load", miniBrowserLoaded);

				var prevActivePage = $.capriza.activePage;
				$.capriza.toMiniBrowser($pageMiniBrowser, prevActivePage);

				// generating dummy header in order to go back to page
				var dummyHeader = $(Handlebars.templates['header']({appName: Utils.getAppName(), extraAction: extraActions}));
				// must clear header so header actions will refresh, Back button return to the real active page (and not the first active page), and extra actions will be updated
				$(".page.mini-browser .header").remove();
				$pageMiniBrowser.prepend(dummyHeader);
				miniBrowser.height($(".viewport").height() - dummyHeader.height());
				dummyHeader.find(".extraAction").on("click", function(e){
					e.stopPropagation();
					Utils.showContextMenu({items: extraActions, bubble: true});
				});
				$('.back-button', dummyHeader).on('click', function() {
					miniBrowserError && clearTimeout(miniBrowserError);
					$.capriza.miniBrowserBack($pageMiniBrowser, prevActivePage);
				}).css('visibility', 'visible');

				Dispatcher.trigger("miniBrowser/show");
			},

			createMiniBrowser: function ($el, control) {
				var launchType= control && control.get('contentAction'),
				    openInNewWindow = control && control.get('openInNewWindow');

				//if (launchType === 'external' && Capriza.device.isMobile && $('a', $el).length === 0) return;

				$("a", $el).each(function () {
					var href = $(this).attr("href");
					var serverSideLinkOrdinal = $(this).attr("serverSideLinkOrdinal");

					if (launchType!="launchMap" && !serverSideLinkOrdinal && !Utils.Links.isSpecialLink(href) && (Capriza.device.isMobile || openInNewWindow)) {
						Utils.Links.createExternalLink(this);
					} else {
						this.addEventListener("click", function (e) {
							if (!Utils.Links.isSpecialLink(href)) {

								e.preventDefault();

								if (!serverSideLinkOrdinal) {
									Capriza.Views.Utils.buildMiniBrowser(href);
									//miniBrowser.attr("src", href);
									//var $pageMiniBrowser = $(".page.mini-browser");
									//$.capriza.changePage($pageMiniBrowser, { transition: "slide" });
									//
									//// generating dummy header in order to go back to page
									//var dummyHeader = $(Handlebars.templates['header']({appName: Utils.getAppName()}));
									//if (!$(".page.mini-browser .header").length) {
									//    $pageMiniBrowser.prepend(dummyHeader)
									//}
									//$('.back-button', dummyHeader).on('click', function() {
									//    pageManager.onBackClick();
									//}).css('visibility', 'visible');
									//
									//Dispatcher.trigger("miniBrowser/show");
								}
								else {

									if (control) {
										control.api.clickInternalLink(parseInt(serverSideLinkOrdinal));
									}

								}

							}
						}, true);
					}
				});

			},

			cutHtml: function (html, len) {

				if (!html) return { changed: false };

				if (html.length <= len) return { changed: false, html: html };

				var count = 0, tags = [], re = /(<\s*(\w+)(?:\s[^>]*)?\s*>)|(<\/\s*\w+\s*>)/g, match;
				for (var i = 0; i < html.length; i++) {
					if (html[i] == "<") {
						re.lastIndex = i;
						match = re.exec(html);
						i += match[0].length - 1;
						if (match[1] !== undefined) // start tag
							tags.push(match[2]);
						else // end tag
							tags.pop();
					} else {
						count++;
					}

					if (count == len) {
						var ret = html.substr(0, i + 1).concat("...");
						var tag;
						while (tag = tags.pop())
							ret = ret.concat("</", tag, ">");
						return { changed: true, html: ret };
					}
				}
				return { changed: false, html: html };
			},

			applyStyleOnElement: function($el, obj, innerSelector) {
				$el.css(obj);

				var inheritStyle = {};
				for (var p in obj) inheritStyle[p] = "inherit";
				$(innerSelector || "*", $el).css(inheritStyle);
			}
		};

		Capriza.Views.ScrollDetector = Backbone.View.extend({
			initialize: function() {
				this.positions = [];

				this._calc = _.bind(this.__calc, this);
				this._debounce = Capriza.device.isMobile ? Utils.debounce(100, _.bind(this.__debounce, this)) : _.bind(this.__debounce, this);
			},

			start: function() {
				this.bottomRef = Capriza.fullScreen ? window.innerHeight : $(".viewport")[0].getBoundingClientRect().bottom;
				window.addEventListener("scroll", this._calc, true);
				window.addEventListener("scroll", this._debounce, true);
				return this;
			},

			stop: function() {
				window.removeEventListener("scroll", this._calc, true);
				window.removeEventListener("scroll", this._debounce, true);
				return this;
			},

			__calc: function() {
				var rect = this.el.getBoundingClientRect();
//            console.log("el bottom: " + rect.bottom + ", " + this.bottomRef);
				this.positions.push(rect.bottom);
			},

			__debounce: function() {
				var self = this;
				var should = _.some(this.positions, function(x) { return (x - 60) <= self.bottomRef; });
//            Logger.debug("debounce (should=" + should + "): " + this.positions);
				this.positions = [];
				if (should) this.trigger("change");
			}
		});

		Capriza.Views.supportedActionControls = /(edit|delete|expand|collapse)/;

		Capriza.Views.usePageUpdateAnimation = true;

		Capriza.Views.uiState = {};

		var miniBrowser;
		Dispatcher.on("app/init", function() {
			$('#mini-browser').remove();
			var $miniBrowserPage = $("<div class='page mini-browser'/>").appendTo(".viewport");

			miniBrowser = $("<iframe id='mini-browser' sandbox='allow-same-origin allow-scripts allow-forms'></iframe>").appendTo($miniBrowserPage).css({
				height: $.capriza.viewportHeight()
			});

			miniBrowser.on("load", function() {
				Logger.debug('mini browser loaded...');
				Dispatcher.trigger('mobile/iframeLoaded');
			})
		});

		// http://stackoverflow.com/questions/7917592/html-cursor-showing-in-readonly-input-text
		$(document).on("focusin", "input[readonly]", function() {
			this.blur();
		});

		if (Capriza.device.isDesktop) {
			// prevent focusing element overlapped by global shield
			function onFocusCapture(event) {
				var gs = $(".global-shield")[0];

				gs && !$.contains(gs, event.target) && Utils.focusContainer(gs);
			}

			document.addEventListener("focus", onFocusCapture, true);
		}
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/GenericView.js

try{
	(function() {
		Capriza.Views.GenericView = Capriza.Views.UiControl.extend({
			_render: function() {
				var self = this,
				    presentationModel = _.extend({
					    uniqueControlId: this.getUniqueControlId(),
					    page: this.options.page,
					    view: this
				    }, this.model.toJSON());

				var widgetName = this.model.get("type");

				if(this.$el[widgetName] === undefined) return null;

				this.$el[widgetName](presentationModel);
				this.inited = true;

				this.$el.on(widgetName.toLowerCase() + "apicall", function(e, data) {
					if (!data || !data.action) {
						Logger.error("No action passed from widget to api call");
						return;
					}

					var action = data.action;
					self.model.api[action].call(self.model.api, data.data);
				});

				this.setIsReadOnly();

				return this.$el;
			},

			update: function(attributes) {
				this.$el.prop("lastUpdated", Date.now());

				if (!$.capriza[this.model.get("type")]) {
					Logger.debug("Warning: Cannot update non existing widget: " + this.model.get("type"));
					return;
				}

				var updateMethod = $.capriza[this.model.get("type")].prototype["update"];

				if (updateMethod) {
					this.$el[this.model.get("type")]("update", attributes);
				}

				for (var p in attributes) {
					var setterName = "set".concat(p.capitalize());
					this.$el[this.model.get("type")]("option", p, attributes[p]);
					var setter = $.capriza[this.model.get("type")].prototype[setterName];
					if (!setter) Logger.debug("Warning: Didn't find setter: " + setterName + " on " + this.model.get("type") + ", id=" + this.model.get("id"));
					else this.$el[this.model.get("type")](setterName, attributes[p]);
				}
			}
		});

		Capriza.Views.GenericCollection = Capriza.Views.GenericView.extend({
			initialize: function() {
				this.initControls(this.model.get("controls"));
			},

			initControls: function(controls) {
				var self = this;
				_.each(controls, function(control) {
					self.options.page.addView(control.get("id"), self.getView(control));
				});
			},

			getView: function(control) {
				return Capriza.Views.createView(control, this.options.page);
			},

			update: function(attributes) {
				if (attributes['controls']) {
					this.initControls(attributes['controls']);
					attributes['controls'] = attributes['controls'].map(function(control) { return control.toJSON(); });
				}

				Capriza.Views.GenericView.prototype.update.apply(this, arguments);
			},

			setIsLast: function(isLast) {
				this.$el.attr("data-is-last", isLast);
				this.inited && this.$el[this.model.get("type")]("setYesMore",this.model.get("yesMore"));
			},

			onMoreItemsArrived: function(startIndex) {
				this.initControls(this.model.get("controls").slice(startIndex));
				this.$el[this.model.get("type")]("option", "controls", this.model.get("controls").map(function(x) { return x.toJSON(); }));
				this.$el[this.model.get("type")]("onMoreItemsArrived", startIndex);
				this.setMcStyle();
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/PageView.js

try{
	;(function() {
		Capriza.Views.PageView = Backbone.View.extend({
			className: "page",

			initialize: function() {
				if (this.model) {
					this.$el.attr("id", this.model.get("id"));
					this.$el.attr("uniqueId", this.model.get("uniqueId"));
				} else if (this.options.id) {
					this.$el.attr("id", this.options.id);
					this.$el.attr("uniqueId", this.options.uniqueId);
				}

				if (this.fullScreen) {
					this.ignoresHeader = true;
				}
			},

			render: function(options) {
				options = _.extend({
					append: true
				}, options);
				this.$el.data("pageView", this);
				if (this.ignoresHeader) this.$el.addClass("ignores-header");
				this._render();
				this._post();
				if (options.append){
					if (this.$pageContainer && this.$pageContainer.length){
						this.$pageContainer.append(this.$el);
						if (!this.$pageContainer.is(":last-child")) {
							this.$pageContainer.appendTo(".viewport");
						}
					} else {
						$(".viewport").append(this.$el);
					}
				}
//            this.setHeight();
				this.trigger("page/rendered", this);
				Dispatcher.trigger("page/rendered", this, this.model);
				return this;
			},

			_render: function() {},
			_post: function() {},

			addContent: function($content) {
				if (!this.$el.children().length){
					$content.addClass("page-content");
				}
				this.$el.append($content);
				return this;
			},

			pageIsModal: function(){
				return this.getRoot && this.getRoot() && this.getRoot().get("isModal");
			},
			setPageAsModal: function(isModal){
				isModal && this.getRoot && this.getRoot() && this.getRoot().set("isModal", isModal);
			},

			show: function(options) {
				options = (options || {});
				$.capriza.changePage(this.$el, _.extend(options, {pageModel: this.model, isModal: this.pageIsModal()}));
				var $viewportOverlay = $("#viewport-overlay");
				if(!(this.state && this.state["overlayActive"]) && $viewportOverlay.hasClass("active") && $viewportOverlay[0].classList.length == 1){
					$viewportOverlay.removeClass('active');
				}
				$('#header-overlay').removeClass('active');
				return this;
			},

			clear: function() {
				this.$el.empty();
			},

			scrollTo: function(x, y) {
				var $activeTab = this.$(".tab-content.active");
				if ($activeTab.length > 0) {
					return $activeTab[0].scrollTop = y;
				} else {
					return this.el.scrollTop = y;
				}
			},

			destroy: function() {
				this.model && this.model.off( null, null, null );
				var $container = this.$el.parent();
				this.$el.remove();
				!$container.length && $container.remove();
				this.remove();
			}
		});

		Capriza.Views.ContextPage = Capriza.Views.PageView.extend({
			initialize: function() {
				var self = this;
				self._views = {};
				self._blockingControls = []; //a collection of blocking controls (e.g. bubble, dropdown)
				Capriza.Views.PageView.prototype.initialize.apply(this, arguments);
				this.$el.addClass("context-page");

				this.setPageAsModal($(".global-shield.modal.active").length > 0 && this.model.tableDrill);
				this.handlePageModal();

				this.addControls();
				//this.setHeader();

				this.model.on("page/controlChanged", function(control, attributes) {
					// search for the UiControl reference and execute proper API function on it
					var view = self.getView(self.getUpdatedControlId(control));
//                Logger.debug('updating view '+control.get("id"));

					if (view){
						attributes = view.sortAttributes(attributes);
						view.update(attributes);
					}
					else {
						Logger.warn('control id '+control.id+' has no view!!');
					}

				});

				this.model.on("page/moreItems", function(control, startIndex) {

					var groupView = self.getView(control.get("id"));

					if (groupView) {
						groupView.onMoreItemsArrived(startIndex);

						/**
						 * NOTE: Until we have event bubbling, we need to manually let the application know about this event
						 */
						Dispatcher.trigger("page/moreItems", { pageView: self, control: control });
					}

				});

				this.model.on("change:controls", function(model, controls, changes) {
					//_.each(self._views, function(view) {
					//    view.destroy();
					//});
					self.getViews(self.model.previousAttributes()["controls"] || []).forEach(function(view){
						view.destroy();
					});
					self.addControls();
					self.clear();
					self.render();
				});

				this.model.on("page/controlAdded", function(controlId, parentId, index) {
					var groupView = self.getView(parentId);
					var model = Capriza.Model.Control.getById(controlId);

					if (model.get("type") == "clickAction") return; //for clickAction, the model just updates, there is no rendering..

					var view = groupView.getView(model);
					self.addView(controlId, view);
					groupView.addViewAtIndex(view, index);
					Dispatcher.trigger("page/controlAdded/after", { model: model, view: view, pageModel: self.model });
				});

				this.model.on("page/controlRemoved", function(controlId) {
					var view = self.getView(controlId);
					if (!view) return;

					view.removeFromPage();
					view.destroy();
					self.removeView(controlId);

				});

				this.model.on("page/controlModified", function(controlId) {
					var model = Capriza.Model.Control.getById(controlId);
					if (!model.parent || model.get("type") == "clickAction") return;

					var groupView = self.getView(model.parent.get("id"));
					if (!groupView) return;
					var oldView = self.getView(controlId);
					oldView.destroy();
					var newView = groupView.getView(model);
					self.addView(controlId, newView);
					oldView.replaceWith(newView);

					Dispatcher.trigger("page/controlModified/after", { model: model, newView: newView, pageModel: self.model });
				});

				this.model.on("page/update/after", function(){
					self.checkLastControl();
				});

				this.scrollListeners = [];
			},

			handlePageContainer: function(){
				if (this.pageIsModal()) {
					var containerName = (this.pageIsModal() ? "modal-" : "full-") + "page-container";
					this.$pageContainer = $("." + containerName);
					if (!this.$pageContainer.length) {
						this.$pageContainer = $("<div></div>").addClass(containerName).addClass("page-container");
					}
				}
			},

			handlePageModal: function(){
				if (this.pageIsModal()){
					Capriza.Views.preparePageModal(this.$el, $(".global-shield").length);
					this.$pageContainer = $(".modal-page-container");
				}
			},

			getUpdatedControlId: function(control) {
				return control.get("id");
			},

			getViewByModel: function() {
				return Capriza.Views.getViewByModel.apply(this, arguments);
			},

			modelToView: Capriza.Views.modelToView,

			addControls: function() {
				var self = this;

				var controlIds = this.getControlsIds();

				if (controlIds) {
					_.each(controlIds, function(controlId) {
						var control = Capriza.Model.Control.getById(controlId);
						if(control.get("missing")) return;
						var view = Capriza.Views.createView(control, self, self.getViewByModel);
						self.addView(controlId, view);
					});

					this.checkLastControl();
				}
			},

			getControlsIds: function() {
				return _.map(this.model.get("root"),function(ctrl){
					return ctrl["id"] || ctrl;
				});
			},

			setScrolling: function () {
				var $scrollingArea = this.$('.scrolling-area, .tab-content'), self = this;
				this.scrollListeners && $scrollingArea.scroll(function(e){
					self.scrollListeners.forEach(function(callback) {
						callback();
					})
				});
			},

			addScrollListener: function(listener) {
				this.scrollListeners.push(listener);
			},

			_render: function() {
				var self = this;
				_.each(this.getControlsIds(), function(controlId) {
					var view = self.getView(controlId);
					var $control = view.render();
					self.addContent($control, view.model);
				});

				this.$el.attr("id", this.getPageId());
				this.setScrolling();
				return this;
			},

			getView: function(modelId) {

				var view = this._views[modelId];

				return view;
			},

			getViews: function(controls) {
				var self = this;
				controls = controls || (this.model.get("root") || []).map(function(controlId) {
						return Capriza.Model.Control.getById(controlId);
					});
				return controls.map(function(control) { return self.getView(control.get("id")); }).filter(function(view) { return !!view; });
			},

			addView: function(modelId, view) {
				if(this._views[modelId] && !this._views[modelId].destroyed){
					Logger.warn("Overriding a not-destroyed view with id ["+modelId+"] and type ["+view.model.get("type")+"]");
					//this._views[modelId].destroy();
				}
				this._views[modelId] = view;
			},

			removeView: function(modelId) {
				delete this._views[modelId];

				var self = this;
				var model = Capriza.Model.Control.getById(modelId), controls = model.get("controls");
				if (controls && controls.length > 0) {
					controls.forEach(function(control) {
						self.removeView(control.get("id"));
					});
				}
				var groupHeader = model.get("groupHeader");
				groupHeader && this.removeView(groupHeader.get("id"));
			},

			getPageId: function() {
				return "page" + this.model.get("id");
			},

			getRoot: function() {
				var controls = this.model.get("root");
				return controls && controls.length && Capriza.Model.Control.getById(controls[0]);
			},

			getBodyViews: function() {
				var bodyControls = this.getRoot() && this.getRoot().get("controls"), self = this, ret = [];
				if (bodyControls && bodyControls.length) {
					bodyControls.forEach(function(control) {
						ret.push(self.getView(control.get("id")));
					});
				}
				return ret;
			},

			checkLastControl: function() {
				var self = this, root = this.getRoot(), lasts = [], lastsInTabs = [];

				if (!root) return;

				function getLastControl(model){
					if(typeof model == "string"){
						model = Capriza.Model.Control.getById(model);
					}
					var retId = model.get("id");

					//TODO: remove grouping after it is not needed
					if((model.get("type")=="panel" || model.get("type")=="grouping") && ( model.get("dock") || !model.get("controls") || model.get("controls").length==0)){
						return;
					}
					//Don't add table/tabular/topLevel/main to the below "if" we never wnt to detect the nested table as the last one so do not go there recursively.
					if ((model.get("type")=="panel" || model.get("type")=="grouping" || model.get("type") === 'tabController' || model.get('type') === 'tab') && model.get("controls")) {
						model.get("controls").forEach(function (mdl) {
							retId = getLastControl(mdl) || retId;
						});
					}

					//save the last control in each tab (for infinite table for tabs)
					model.get('type') === 'tab' && lastsInTabs.push (retId);

					return retId;
				}

				function setIsLastForAll(model){
					if(typeof model == "string"){
						model = Capriza.Model.Control.getById(model);
					}
					var modelId = model.get("id");

					if((model.get("type")=="panel" || model.get("type")=="grouping") && ( model.get("dock") || !model.get("controls") || model.get("controls").length==0)){
						return;
					}
					var view =  self.getView(modelId);
					view && view.setIsLast && view.setIsLast(lasts.indexOf(modelId) > -1);

					if(/(panel|tabController|tab|table|tabular|topLevel|main)/g.test(model.get("type"))
						&& model.get("controls")) {
						model.get("controls").forEach(function (mdl) {
							setIsLastForAll(mdl);
						});
					}
				}

				lasts = lasts.concat([getLastControl(root)], lastsInTabs);
				setIsLastForAll(root);
			},

			destroy: function() {
				this.getBodyViews().forEach(function(view) {
					view && view.destroy();
				});
				Capriza.Views.PageView.prototype.destroy.call(this);
			},

			replaceHeaderContent: function($content) {
				// don't show sideburger on podal pages, or drill pages that started in modal
				if (!this.pageIsModal()) {
					Dispatcher.trigger('sideburger/show', $content);
				}
			},

			//handles inner uiConrols that may block the page interaction (e.g. bubble, dropdown..)

			addBlockingControl: function(view){
				if (!view) return;
				var viewAlreadyExist = _.find(this._blockingControls, function(bc){ return bc.model.get("id") == view.model.get("id") });
				if (!viewAlreadyExist){
					this._blockingControls.push (view);
					Logger.debug("[PageView] added a blocking control: " + view.model.get("id") + ", for page: " + this.model.get("uniqueId"));
				}
			},
			popBlockingControl: function(){
				this._blockingControls.pop();
			},
			removeBlockingControl: function(view){
				var newBlockingControls = _.filter(this._blockingControls, function(bc){return bc.model.get("id") != view.model.get("id")});
				if (newBlockingControls.length != this._blockingControls)
					Logger.debug("[PageView] removed a blocking control: " + view.model.get("id") + ", for page: " + this.model.get("uniqueId"));
				this._blockingControls = newBlockingControls;
			},
			//iterativly calls unBlockPage() for each blockingControl in the stack, assuming the control will remove itself from the stack
			unblockAllBlockingControls: function(){
				var blockingConrolsCount = this._blockingControls.length;
				if (blockingConrolsCount > 0){
					for (var i = blockingConrolsCount - 1; i >= 0; i--){
						this._blockingControls[i].unblockPage();
					}
				}
			}

		});

		Capriza.Views.BasePage = Capriza.Views.PageView.extend({
			initialize: function() {
				Capriza.Views.PageView.prototype.initialize.apply(this, arguments);
				this._initialize && this._initialize();
				_.bindAll(this, "changeControls", "controlChanged", "controlAdded", "controlRemoved", "controlModified");

				this.model.on("change:controls", this.changeControls);
				this.model.on("page/controlChanged", this.controlChanged);
				this.model.on("page/controlAdded", this.controlAdded);
				this.model.on("page/controlRemoved", this.controlRemoved);
				this.model.on("page/controlModified", this.controlModified);
			},

			changeControls: Utils.noop,
			controlChanged: Utils.noop,
			controlAdded: Utils.noop,
			controlRemoved: Utils.noop,
			controlModified: Utils.noop
		});

		Capriza.Views.LoadingPage = Capriza.Views.PageView.extend({
			_render: function() {
				this.$el.addClass("loading-page");
				this.addContent('<div class="spinner"></div>');
			}
		});

		Capriza.Views.DummyPage = Capriza.Views.PageView.extend({
			render: function(options) {
				options = _.extend({
					append: true
				}, options);
				this.$el.addClass("dummy-page");

				var $dummyHeader = $(Handlebars.templates['header']({appName: ""}));
				$dummyHeader.find(".back-button").css("visibility","hidden");
				Dispatcher.trigger("sideburger/show", $dummyHeader);

				this.$el.prepend($dummyHeader).appendTo(".viewport");
				return this;
			},
			show: function() {
				this.$el.addClass("active");
				return this;
			}
		});

		$(document).bind("pagechange", function( event, data ){
			var pageView = data.toPage.data("pageView"), pageModel = pageView && pageView.model;

			// TODO: roadblock 29/9/2013 - after that we should erase the "backable" and "popup" conditions
			if (pageModel && (pageModel.get("backControl") || pageModel.tableDrill )) {
				Dispatcher.trigger("backButton/show");
			} else if (data.toPage.attr("id") && data.toPage.attr("id").indexOf("mini-browser") > -1) {
				Dispatcher.trigger("backButton/show");
			} else {
				Dispatcher.trigger("backButton/hide");
			}

			Dispatcher.trigger("header/pageChange");

		});

		Dispatcher.on("page/beforeChange", function(e) {
			var pageView = e.fromPage.data("pageView"), uiState, uniqueId;

			if (!pageView || !pageView.model) return;

			var pageModel = pageView.model;

			if (pageModel.get("uniqueId") !== undefined) {
				uniqueId = pageModel.get("uniqueId");
				uiState = Capriza.Views.uiState["page" + uniqueId] || {};
				uiState.page = pageModel;
				uiState.selectedTab = pageView.currentSelectedTab();
				uiState.scrollPosition = $.capriza.currentScrollPosition();
			} else if (pageModel.tableDrill) {
				uniqueId = pageModel.get("parentPage").get("uniqueId");
				uiState = Capriza.Views.uiState["page" + uniqueId] || {};
				uiState.drillId = pageModel.get("root")[0];
				uiState.drillIndex = pageModel.get("parentPage").drillIndex;
				uiState.tableId = pageModel.get("tableId");
				uiState.drillScrollPosition = $.capriza.currentScrollPosition();
			}

			if (typeof uniqueId !== "undefined") {
				if (uiState) Logger.debug("saving ui state on page " + uniqueId + ": selectedTab=" + uiState.selectedTab + ", scrollPosition: " + uiState.scrollPosition + ", drillId=" + uiState.drillId + ", drillIndex=" + uiState.drillIndex + ", tableId=" + uiState.tableId + ", drillScrollPosition=" + uiState.drillScrollPosition);
				else Logger.debug("resetting ui state on page " + uniqueId);
				Capriza.Views.uiState["page" + uniqueId] = uiState;
			}



		});

		var listTableRegex = /^(list|table|tabular|table2)$/;
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/pages/MVPageView.js

try{
	/**
	 * Created by oriharel on 1/18/15.
	 */

	;(function() {
		var getText = Capriza.translator.getText.bind(Capriza.translator);

		Capriza.Views.MVPageView = Capriza.Views.ContextPage.extend({

				expiredHandler: undefined,
				mvpTimeout: undefined,

				initialize: function() {

					Capriza.Views.ContextPage.prototype.initialize.apply(this, arguments);

					this.mvpTimeout = ClientCache.getItem(Capriza.Views.MVPageView.zappDataKey+Capriza.getToken()+'-timeout') || 60000;

					if (this.model.mvp) this.$el.addClass('mvp');
					if (this.model.mvppp) this.$el.addClass('mvppp');

					Dispatcher.on('app/newVersionDownloading', function() {
						var msg = {type: "progress",
							messageText: getText("newVersion"),
							detailText: getText("zappReloadAuto")};

						Utils.showUnimessage(msg, false, true);
					});

					Dispatcher.on("app/offline", this._onOffline, this);
					Dispatcher.on("app/online", this._onOnline, this);
					_.bindAll(this, "rearmMVPTimeOut");
				},

				rearmMVPTimeOut: function() {
					Logger.debug('arming mvp timeout');
					if (this.expiredHandler) clearTimeout(this.expiredHandler);
					this.expiredHandler = setTimeout(function() {
						Logger.error('[MVP] mvpTimerExpired triggered', undefined, "mvp");
						Dispatcher.trigger('mvpTimerExpired', {cause: "mvpTimerExpired"});
					}, this.mvpTimeout);
				},

				// Cancels MVP updating timeout and shows Offline-toast
				_onOffline: function () {
					Logger.debug("MVP offline");
					clearTimeout(this.expiredHandler);

					var msg = {messageText: getText("mvpOffline"),
						actionText: getText("gotIt"),
						action: Utils.hideUnimessages.bind(Utils)};

					Utils.showUnimessage(msg, false, true);
				},

				// Starts MVP updating timeout and shows Updating-toast
				_onOnline: function () {
					Logger.debug("MVP online");
					this.rearmMVPTimeOut();

					if (Utils.isCachedMVPShown()) {
						var s = getText("mvpUpdating");
						var t = getText("lastUpdated") + " " + this.lastUpdateDate;

						Utils.showUnimessage(
							{type: "progress", messageText: s, detailText: t},
							false, true);
					}
				},

				_render: function() {
					Capriza.Views.ContextPage.prototype._render.apply(this, arguments);
					Dispatcher.trigger("mobile/active");

					var errorCallback = function(data) {
						Logger.tag("MVPError");
						Logger.error('MVPageView update Error received', undefined, "mvp", JSON.stringify(data));

						var messageText = getText("somethingIsWrong");
						var detailText = getText("couldNotUpdatePage");
						var actionText = getText("retry");

						var msg = {type: "error", messageText: messageText,
							detailText: detailText, actionText: actionText,
							action: Utils.reload};

						Utils.showUnimessage(msg, false, true);
					};

					Dispatcher.on('application/contextNotFound mvpTimerExpired handleResponseError', errorCallback, this);

					var timestamp = this.model.get('timestamp');
					moment.locale(Capriza.translator.getLang());
					var momentDate = moment(parseFloat(timestamp));

					this.lastUpdateDate = momentDate.fromNow();

					Logger.debug('showing mvp from: ' + this.lastUpdateDate);

					var _this = this;

					Dispatcher.on('page/change/after', function(options) {
						if (options.toPage.hasClass('mvp')) {
							if(options.toPage.hasClass("mvppp")) {
							} else if (Capriza.Connection.isOnline) {
								_this._onOnline();
							} else {
								_this._onOffline();
							}
						}
						else if (!Utils.isCachedMVPShown()) {
							$(".mvp").removeClass("mvp mvppp").addClass("was-mvp");
							Utils.hideUnimessages();
						}
					}, this);

					Logger.debug("[MVP] starting the expiration timer");

					Dispatcher.on('page/newPage', this.rearmMVPTimeOut);
					Dispatcher.on('mvp/newContentReady', function (options) {
						Capriza.aboutToShowMVP = false;
						clearTimeout(_this.expiredHandler);
						Dispatcher.off('page/newPage', _this.rearmMVPTimeOut);
						Dispatcher.off("app/offline", this._onOffline);
						Dispatcher.off("app/online", this._onOnline);

						Dispatcher.off(undefined, undefined, _this);

						if(!options.newOnlinePageView){
							Logger.debug('[MVP] MVP++ just got in sync with engine');
							$(".mvp").removeClass("mvp mvppp").addClass("was-mvp");

							Dispatcher.trigger("engineApi/unsyncedMessages", false);
							return;
						}
						Logger.debug('[MVP] showing new content is ready msg');

						Utils.hideUnimessages();
						//var activePage =$('.page.active');
						//if (activePage.length > 0) {
						//    options.newOnlinePageView.$el.attr('style',activePage.attr('style'));
						//}

						options.newOnlinePageView.show({ transition: 'none' });

					}, this);

					Dispatcher.on("page/update/after", function (eventData){
						if (Utils.isCachedMVPShown() && !eventData.response.cached) {
							Dispatcher.trigger('mvp/newContentReady', {});
						}
					}, this);

					Dispatcher.on("control/updates/before", function (response){
						if (Utils.isCachedMVPShown("mvppp") && !response.cached && response.mvp) {
							Dispatcher.trigger('mvp/newContentReady', {});
						}
						if (!Utils.isCachedMVPShown() && response.mvp) {
							_this.$el.appendTo(".viewport");
							_this.show();
						}
					}, this);

					return this;
				}
			}
		);


		Capriza.Views.MVPageView = _.extend(Capriza.Views.MVPageView, {

			isMvp: true,

			zappDataKey: 'bgs-',

			writingQueue: [],

			backgroundHandler: function(response) {

				if(Utils.isCachedMVPShown("mvppp") || Utils.wasCachedMVPShown()) return;
				Logger.debug('has mvp in message '+response.resultType);
				// var zappDataStr = ClientCache.getItem(Capriza.Views.MVPageView.zappDataKey+Capriza.getToken())
				// if (!zappDataStr || response.resultType === 'newPage') {
				//     localMvpObj = [];
				// }
				// else {
				//     localMvpObj = JSON.parse(zappDataStr).mvp;
				// }

				//mark timestamp - this just received from the engine now.
				if (response.page) {
					response.page.timestamp = Date.now();

					//TODO - for debug purpose only. you can remove this.
					var momentDate = moment(parseFloat(response.page.timestamp));
					var formattedDate = momentDate.format('MM/DD/YYYY [at] hh:mma');
					Logger.debug('new mvp arrived. marking time: '+formattedDate);
				}

				var processedResponse = SharedUtils.processMvpResponse(response);

				this.saveMvp(processedResponse);

				this.reportToWrapper('background/mvpEnabled');

				// fix two issues: ticket #18069 - MVP on login page
				// 1. was called multiple times!
				// 2. identity/host/logout already triggered removing the whole file, so no need to also call remove mvp from this file
				Dispatcher.off("identity/host/logout", this._onClearMVP).on("identity/host/logout", this._onClearMVP, this);
				Dispatcher.off("mobile/error", this._onClearMVPAndNotifyWrapper).on("mobile/error", this._onClearMVPAndNotifyWrapper, this);
			},

			_onClearMVP: function() {
				Logger.debug("[MVPageView] : _onClearMVP is called");
				$(".mvp").removeClass("mvp mvppp").addClass("was-mvp");
				Utils.hideUnimessages();
				this.removeCachedMVP();
			},

			_onClearMVPAndNotifyWrapper: function() {
				Logger.debug("[MVPageView] : _onClearMVPAndNotifyWrapper is called");
				this._onClearMVP();
				Dispatcher.trigger('mvp/remove');
			},

			saveMvp: function(localMvpObj) {
				Logger.debug('saveMvp started with '+localMvpObj.resultType+' resultType');
				// var mvpStoreKey = 'bgs-'+Capriza.getToken();

				if (localMvpObj.resultType === 'newPage') {
					this.writingQueue = [localMvpObj];
				}
				else {
					this.writingQueue.push(localMvpObj);
				}

				// if (localMvpObj.resultType !== 'newPage') {
				//     var zappDataStr = ClientCache.getItem(mvpStoreKey);
				//     var zappData = zappDataStr && JSON.parse(zappDataStr);
				//     var localMvpMessages = fileMvp || zappData && zappData.mvp;
				//
				//     localMvpMessages && localMvpMessages.push(localMvpObj);
				// }



				Dispatcher.trigger('mvp/saveMvpInFile', this.writingQueue);
			},

			reportToWrapper: function(event, payload) {

				if (Capriza.Capp && Capriza.Capp.messenger) {
					Logger.debug("reporting to wrapper: "+event);
					payload = payload || {};
					var zappId = window.appData && window.appData.app_id;
					var args = _.extend(payload, {zappId: zappId});
					Capriza.Capp.messenger.emit(event, args);
				}
				else {
					Logger.debug("NOT reporting to wrapper: "+event);
				}
			},

			removeCachedMVP: function() {
				ClientCache.removeItem(Capriza.Views.MVPageView.zappDataKey+Capriza.getToken());
				ClientCache.removeItem(Capriza.Views.MVPageView.zappDataKey+Capriza.getToken()+'-mvpId');
			},


			loadMVP: function() {
				Logger.debug('loadMVP started');
				var mvpStoreKey = 'bgs-'+Capriza.getToken();

				function loadMvpCallback(fileMvp) {
					if($(".context-page.active").length) {
						Logger.debug("returned to loadMvpCallback after new page already arrived, no need to do fallback to localstorage");
						return;
					}

					var zappDataStr = ClientCache.getItem(mvpStoreKey);
					var zappData = zappDataStr && JSON.parse(zappDataStr);
					var localMvpMessages = fileMvp || zappData && zappData.mvp;

					if (localMvpMessages && !Utils.isInDevMode()) {
						$.capriza.activePage = $([]);

						Logger.debug('handling mvp ['+localMvpMessages.length+'] messages appCache status: '+applicationCache.status+' Capriza.firstRun: '+Capriza.firstRun);
						take('loadingMVP');
						Capriza.aboutToShowMVP = true;

						localMvpMessages.forEach(function(message, i) {
							message.cached = true;
							setTimeout(function(){
								if($("#error-page.active").length == 1) return;
								handleResponse(message)
							}, i*50);
							//handleResponse(message);
						});
						//setTimeout(function(){Dispatcher.trigger("app/loaded")}, localMvpMessages.length*50);
						Logger.debug("handling mvp - ended");
						Logger.tag("MVPShown");
						// Capriza.Views.MVPageView.removeCachedMVP();
						//Dispatcher.trigger("mobile/active");
						if(localMvpMessages[0] && localMvpMessages[0].mvppp ) {
							Dispatcher.trigger("engineApi/unsyncedMessages", true);
						}
					}
					else {
						Logger.debug('zapp has no MVP or in dev mode');
					}
				}

				Utils.getMvpFromFile(mvpStoreKey, loadMvpCallback);

			}
		});

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/pages/CNFPageView.js

try{
	/**
	 * Created by maayankeenan on 4/19/15.
	 */
	;(function() {
		Capriza.Views.CNFPageView = Capriza.Views.ContextPage.extend({

			initialize: function () {
				Capriza.Views.ContextPage.prototype.initialize.apply(this, arguments);
			},

			_render: function () {
				Capriza.Views.ContextPage.prototype._render.apply(this, arguments);

				if (!window.isDesignerPreview){
					$('.cnf-restart', this.$el).on('click', function(){
						Utils.reload();
					});
				} else {
					$('.cnf-restart', this.$el).on('click', function(){
						window.DesignerDispatcher.trigger("mobile/restart");
					});
				}

				return this;
			}

		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/pages/SettingsPageView.js

try{
	/**
	 * Created by omer on 20/7/15.
	 */

	;(function() {

		Capriza.Views.SettingsPage = Capriza.Views.PageView.extend({

			id: "settings-page",
			fullScreen:true,

			_render: function () {
				var self = this;
				if (!this.$settingsPage) {
					var settingsForText = Capriza.translator.getText(Capriza.translator.ids.settingsFor)+" "+Utils.getAppName();
					var doneText = Capriza.translator.getText(Capriza.translator.ids.doneCaptial);
					this.$settingsPage = this.$el.append(Handlebars.templates["settings-page"]({settingsForText: settingsForText, doneText: doneText}));
					this.$content = this.$(".settings-content");
				}
				this.$settingsPage.appendTo(".viewport");
				this.populateSettings();
				this.$(".close").on("click", function () {
					self._leave();
				});


				self.$el.addClass("slideup in active");
				self.$el.one("animationend webkitAnimationEnd", function () {
					self.$el.removeClass("slideup in");
					$(".nonmobile-wrap").removeClass("transitioning");

					Dispatcher.trigger('settingsPage/open');
				});
				$(".nonmobile-wrap").addClass("transitioning");


			},

			allEnabledSettings: function () {

				var settings = [
					{type: "header", text: Capriza.translator.getText(Capriza.translator.ids.caching), enabled: Capriza.CacheManager.isHistAllowed},
					{
						type: "toggle",
						text: Capriza.translator.getText(Capriza.translator.ids.saveFormText),
						description: Capriza.translator.getText(Capriza.translator.ids.rememberHistory),
						isOn: Capriza.CacheManager.isHistEnabled,
						handler: function (on) {
							Capriza.CacheManager.setHistEnabledState(on);
						},
						enabled: Capriza.CacheManager.isHistAllowed
					},
					{
						type: "button", text: Capriza.translator.getText(Capriza.translator.ids.clearHistory), handler: function ($btn) {
						Capriza.Confirmer.confirm({
							items: [
								{header: Capriza.translator.getText(Capriza.translator.ids.areYouSureHistory)},
								{
									button: Capriza.translator.getText(Capriza.translator.ids.clearHistory),
									iconClass: "icon-trash",
									cssClass: "clear-history-confirmer-button",
									handler: function () {
										$btn.addClass("disabled").find("button").prop({disabled:"disabled"});
										Capriza.CacheManager.clearAllHist();
									}
								},
								{button: Capriza.translator.getText(Capriza.translator.ids.cancel), iconClass: "icon-close"}
							]
						});
					},
						enabled: Capriza.CacheManager.isHistAllowed
					}
				];

				var enabled = settings.filter(function (item) {
					if (typeof item.enabled == "function") {
						return item.enabled();
					}
					else if (item.enabled === undefined) {
						return true;
					}
					else {
						return item.enabled;
					}
				});

				if (enabled.length == 0) {
					return [{type: "header", text: Capriza.translator.getText(Capriza.translator.ids.noSettings)}];
				}

				return enabled;

			},

			populateSettings: function () {
				var self = this;
				var settings = this.allEnabledSettings();
				self.$content.empty();
				var handlers = {
					button: function ($el, item) {
						$el.find("button").on("click", function (e) {
							item.handler($el, e);
						})
					},
					toggle: function ($el, item) {
						var on = true;
						if(typeof item.isOn == "function") {
							on = item.isOn();
						}
						else if(item.isOn !== undefined){
							on = item.isOn;
						}
						$el.toggleClass("on", on);

						$el.on("click", function () {
							$el.toggleClass("on");
							item.handler($el.hasClass("on"));
						})

					}
				};

				settings.forEach(function (item) {
					var $el = $(Handlebars.templates["settings-page-" + item.type](item)).appendTo(self.$content);
					handlers[item.type] && handlers[item.type]($el, item);
				});

			},


			_leave: function () {
				var self = this;
				self.$el.addClass("slideup reverse out");
				self.$el.one("animationend webkitAnimationEnd", function () {
					self.$el.removeClass("slideup reverse out active");
					$(".nonmobile-wrap").removeClass("transitioning");
					self.$settingsPage.remove();
				});
				$(".nonmobile-wrap").addClass("transitioning");


			}
		});

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/RuntimeParams.js

try{
	;(function() {

		Capriza.RuntimeParams = function(type) {
			this._type = type;
			this._initListeners();
		};

		Capriza.RuntimeParams.prototype = {
			get rtParamsKey() {
				var tokenOrId = (window.appData && appData.app && appData.app.master_app_id) || Capriza.getToken();
				return "rtParams-" + this._type + "-" + this._getUserId() + "-" + tokenOrId;
			},

			setRTParam : function(key, value) {
				var currentRTParams = EncryptedCache.getItem(this.rtParamsKey) || {};
				var oldRTParamValue = currentRTParams[key];
				currentRTParams[key] = value;

				EncryptedCache.setItem(this.rtParamsKey, currentRTParams);

				if (currentRTParams[key] != oldRTParamValue)
					Dispatcher.trigger("runtimeParams/rtParamChanged", [{ key : key, value : currentRTParams[key] }]);
			},

			verifyRTParam : function(key, value, equalsCallback) {
				var currentRTParams = EncryptedCache.getItem(this.rtParamsKey) || {};
				if (currentRTParams.hasOwnProperty(key) && (equalsCallback ? !equalsCallback(currentRTParams[key], value) : currentRTParams[key] != value))
					this.clearRTParams([key]);
			},

			clearRTParams : function(rtParams) {
				var currentRTParams = EncryptedCache.getItem(this.rtParamsKey) || {}, removedRTParams = [];
				(rtParams || Object.keys(currentRTParams)).forEach(function(rtParamKey) {
					if (currentRTParams.hasOwnProperty(rtParamKey)) {
						delete currentRTParams[rtParamKey];
						removedRTParams.push({ key : rtParamKey, value : null });
					}
				});

				if (removedRTParams.length == 0) return;

				EncryptedCache.setItem(this.rtParamsKey, currentRTParams);
				Dispatcher.trigger("runtimeParams/rtParamChanged", removedRTParams);
			},

			_initListeners : function() {
				var $this = this;
				Dispatcher.on("security/ready", function() {
					var rtParams = EncryptedCache.getItem($this.rtParamsKey);
					Logger.debug("onSecurityReady, has rtParams:" + !!rtParams);
					if (rtParams) // && !Utils.isRunningInBackground()
						Capriza.EngineApi.sendEvent(null, null, null, { type : "rtParams", value : rtParams });
				});

				Dispatcher.on("rtParams/invalid", function(data) {
					$this.clearRTParams(data.rtParams);
				});
			},

			_getUserId : function() {
				return window.appData && window.appData.user_id || 0;
			}
		};

		Dispatcher.on("runtimeParams/rtParamChanged", function(data) {
			var rtParamsEventObj = {};
			data.forEach(function(rtParamObj) { rtParamsEventObj[rtParamObj.key] = rtParamObj.value; });
			Capriza.EngineApi.sendEvent(null, null, null, { type : "rtParams", value : rtParamsEventObj });
		});

		if (!window.EncryptedCache) {
			window.EncryptedCache = {
				setItem : function() {},
				getItem : function() {}
			};
		}

	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/CacheManager.js

try{
	;(function() {

		var cm =Capriza.CacheManager = {


			_getUserId:function(){
				return window.appData && window.appData.user_id || 0;
			},

			get histKey(){
				var tokenOrId = window.appData && appData.app && appData.app.master_app_id || Capriza.getToken();
				return "hist-" + cm._getUserId() + "-" + tokenOrId;
			},

			getControlKey:function(model){
				return model.get("cacheData") && model.get("cacheData").key;
			},

			getPersonalizedRTParamKey:function(model){
				return (model.get("cacheData") && model.get("cacheData").rtParamKey);
			},

			_exampleHistStorage:{ // key is hist-8-5813 where userId is 8 and masterZapp id is 5813

				disabled:true,
				"mc53":[
					{
						text:"some item",
						additionals:[
							{mcId:"mc66",text:"description of some item"}
							//...
						]
					}
					//...
				]

			},

			setHistory:function(model, data){
				if(!cm.isHistEnabled()) return;

				var controlKey = cm.getControlKey(model);
				if (!controlKey) return;

				var key  = cm.histKey;
				var currentHist = EncryptedCache.getItem(key) || {};
				var currentMc = currentHist[controlKey] || [];
				var newItem;
				var currentItemIndex = -1;
				var currentItem = currentMc.filter(function(itm, idx){
						if(itm.text == data.text) currentItemIndex = idx; // Assuming we always have one match
						return itm.text == data.text;
					})[0] || ((newItem = true) && {});


				if(currentItemIndex > -1) currentMc.splice(currentItemIndex, 1);
				if(newItem){
					currentItem = data;
				}
				else if(data.additional){
					currentItem.additional = data.additional;
				}

				currentMc.splice(0, 0, currentItem);
				currentHist[controlKey] = currentMc;

				EncryptedCache.setItem(key, currentHist);
			},

			setPersonalizedRTParam:function(model, text) {
				var controlRTParamKey = cm.getPersonalizedRTParamKey(model);
				if (controlRTParamKey) rtp.setRTParam(controlRTParamKey, text);
			},

			verifyPersonalizedRTParam:function(model, text) {
				var controlRTParamKey = cm.getPersonalizedRTParamKey(model);
				if (controlRTParamKey) rtp.verifyRTParam(controlRTParamKey, text, function(oldVal, newVal) { return (oldVal && oldVal.trim()) == (newVal && newVal.trim()); });
			},

			getHistory:function(model){
				if(!cm.isHistEnabled()) return [];

				var controlKey = cm.getControlKey(model);
				if (!controlKey) return [];

				var key  = cm.histKey;
				var currentHist = EncryptedCache.getItem(key) || {};

				return (currentHist[controlKey] || []).map(function(itm, idx){//TODO: think maybe to put hist flag on save ?
					itm.hist = true;
					itm.histIdx = idx;
					return itm;
				});
			},

			removeHistory:function(model){
				var controlKey = cm.getControlKey(model);
				if (!controlKey) return;

				var key  = cm.histKey;
				var currentHist = EncryptedCache.getItem(key) || {};

				delete currentHist[controlKey];
			},

			removeItemFromHist: function(model, idx){
				var controlKey = cm.getControlKey(model);
				if (!controlKey) return;

				var key  = cm.histKey;
				var currentHist = EncryptedCache.getItem(key) || {};
				if(!currentHist[controlKey] || currentHist[controlKey].length <= idx) return;
				currentHist[controlKey].splice(idx, 1);

				EncryptedCache.setItem(key, currentHist);
			},

			clearAllHist:function(){
				var key  = cm.histKey;
				var currentHist = EncryptedCache.getItem(key) || {};
				var newHist = {};
				if (currentHist.hasOwnProperty("disabled")) {
					newHist.disabled = currentHist.disabled;
				}
				EncryptedCache.setItem(key, newHist);
				cm.clearPersonalizedRTParams();
				Capriza.Model.Caching.refreshAllCachedControls();
			},

			clearPersonalizedRTParams:function(rtParams){
				rtp.clearRTParams(rtParams);
			},

			isHistAllowed:function(){
				return window.appData && appData.config.clientCacheEnable !== false;
			},

			isHistEnabled:function(){
				if(!cm.isHistAllowed()) return false;
				var key  = cm.histKey;
				var currentHist = EncryptedCache.getItem(key) || {};
				return !currentHist.disabled;
			},

			setHistEnabledState:function(enabled){
				var key  = cm.histKey;
				var currentHist = EncryptedCache.getItem(key) || {};
				currentHist.disabled = !enabled;

				EncryptedCache.setItem(key, currentHist);
				Capriza.Model.Caching.refreshAllCachedControls();
			}
		}

		var rtp = new Capriza.RuntimeParams("personalized");

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/Confirmer.js

try{
	/**
	 * Created by omer on 20/7/15.
	 */

	;(function() {

		Capriza.Confirmer = {

			confirm: function(options) {
				var self = this;
				var $confirmerEl  = $(Handlebars.templates['confirmer'](options));
				this.$confirmShield = Utils.shieldUp("confirmShield",true).css({"background":"rgba(0,0,0,0)","transition":"background-color 0.2s"});
				this.$confirmShield.on("click",function(e){
					self.hideConfirm();
				});
				this.$confirmShield[0].offsetWidth;

				$('.viewport').append($confirmerEl);
				var height = $confirmerEl[0].offsetHeight;
				$confirmerEl.css({transform: "translateY("+(height)+"px)"});

				$confirmerEl.velocity({
					translateY: height
				}, {
					duration: 30,
					easing: 'out',
					complete: function() {
						$confirmerEl.removeClass('hidden');
					}
				}).bind(this)

					.velocity({
						translateY: 0
					}, {
						duration: 250,
						easing: 'ease-in-out'
					}).bind(this);


				options.items.forEach(function(itm,idx){
					if(itm.button){
						$(".confirmer-btn"+idx+" button").on("click", function(){
							itm.handler && itm.handler();
							self.hideConfirm();
						})
					}
				});
				this.$confirmShield.css({"background":"rgba(0,0,0,0.4)"});

			},

			hideConfirm: function() {
				var $confirmerEl = $('.confirmer');
				var height = $confirmerEl[0].offsetHeight;

				this.$confirmShield.css({"background":"rgba(0,0,0,0)"});
				$confirmerEl.velocity({
					translateY: height
				}, {
					duration: 250,
					easing: 'out',
					complete: function() {
						$confirmerEl.remove();
						Utils.shieldDown("confirmShield");
					}
				})
			}
		}


	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/login/LoginManager.js

try{
	/**
	 * Created with JetBrains WebStorm.
	 * User: oriharel
	 * Date: 1/20/14
	 * Time: 12:54 PM
	 * To change this template use File | Settings | File Templates.
	 */

	;(function() {

		Capriza.LoginManager = {

			credentialsSavedForHosts: {}, //holds the hosts we have credentials for. key(host)-value(true/false)
			credentialsSavedForContexts: {}, //holds the login context ids we have credentials for.
			loggedInHosts: {}, //holds the hosts relevant for login (pending or logged-in). true = logged in, false = pending.
			loggedInContexts: {}, //holds the context ids relevant for login (pending or logged-in). true = logged in, false = pending.
			autoLoginPerformed: undefined, //holds the context of the last auto-login that was performed, or nothing/false if no auto login was performed.
			firstLoginCtx: undefined,
			sendMsgHandler: undefined,
			messagesForBulk: [], //holds the messages to be sent as bulk in the background run

			LOGIN_VERSION: 4,

			credentialsTypes:{
				IDENTITY_KEYS: "identityKeys", //mobile controls
				LOGIN1_KEYS:"login1Keys" //username1, 2, 3, password (used for NTLM)
			},

			_getUserId:function(){
				return window.appData && window.appData.user_id || 0;
			},

			_getIdentityLocalStorageKey: function(host){
				var l4Prefix ="identity" + this.LOGIN_VERSION + "-",
				    user_Id = this._getUserId();

				//Login 4 keys
				return l4Prefix + user_Id + "-" + host
			},

			_writeCredentialsToLocalStorageKey: function(credentials, localStorageKey) {
				var val = JSON.stringify(credentials);
				var encrypted = GibberishAES.enc(val, window.EncryptedCache.xkcd);

				ClientCache.setItem(localStorageKey, encrypted);
			},

			_saveCredentialsOnLocalStorageKey: function(credByHost, credentialsType, localStorageKey) {
				var creds = this._getSpecificSavedCredentials(localStorageKey) || { loginVersion:this.LOGIN_VERSION };

				//in case it is taken from an old key we need to discard old structure and recreate it for new key (will not impact older zapps on same device)
				if(creds.loginVersion != this.LOGIN_VERSION) creds = {loginVersion:this.LOGIN_VERSION};
				if(!creds[credentialsType]) creds[credentialsType] = {};


				creds[credentialsType] = $.extend(true, {}, creds[credentialsType], credByHost);

				this._writeCredentialsToLocalStorageKey(creds, localStorageKey);
			},

			saveCredentialsForType: function(credentials, credentialsType, host) {
				var key = this._getIdentityLocalStorageKey(host), credByHost = {};
				credByHost[host] = credentials;
				this._saveCredentialsOnLocalStorageKey(credByHost, credentialsType, key);
				Capriza.LoginManager.credentialsSavedForHosts[host] = true;
			},

			_exampleCredentials: {
				loginVersion:4,
				identityKeys:{
					"hostname1":{
						"key1":{},//Some mc model
						"key2":{},//Some mc model
						"key3":{}//Some mc model
					},
					"hostname2":{
						//.....
					}
				},
				login1Keys:{
					"hostname1":{username:"aaa",password:"sdfsd",additionalExampleLogin2Field:"..."},
					"hostname2":{username:"afgbfaa",password:"nytt",additionalOtherExampleLogin2Field:"..."}
				}
			},

			clearCredentials: function(){
				Capriza.LoginManager.credentialsSavedForHosts && Object.keys(Capriza.LoginManager.credentialsSavedForHosts).forEach(Capriza.LoginManager.clearCredentialsForHost);
			},

			clearCredentialsForHost: function(host){
				var key = Capriza.LoginManager._getIdentityLocalStorageKey(host);//, credByHost ={};
				Capriza.LoginManager.credentialsSavedForHosts[host] = false;
				ClientCache.removeItem(key);
			},

			_decryptCredentials:function(identity, localStorageKey){
				var decrypted;
				if (identity) {
					try {
						decrypted = GibberishAES.dec(identity, window.EncryptedCache.xkcd);
						decrypted = JSON.parse(decrypted);
					} catch (ex) {
						decrypted = undefined;
						var hash_xkcd = "no MBOOT Security";
						if (typeof MBOOT !== 'undefined' && MBOOT.Security.ec){
							hash_xkcd = MBOOT.Security.ec.hash().update(window.EncryptedCache.xkcd).digest('hex');
						}
						logger.error("failed to decrypt identity data from local storage key: " + localStorageKey + ", hash(xkcd): " + hash_xkcd , ex, "login");
					}
				}
				return decrypted;
			},

			_getSpecificSavedCredentials:function(localStorageKey){
				var identity, decrypted;
				identity = ClientCache.getItem(localStorageKey);
				decrypted = this._decryptCredentials(identity, localStorageKey);
				return decrypted;
			},

			isLoginRequired: function(){
				//if there are no hosts and no login contexts -> no login required.
				var loginRequiredInTheZapp = Object.keys(Capriza.LoginManager.loggedInHosts).length > 0 || Object.keys(Capriza.LoginManager.loggedInContexts).length > 0;
				return loginRequiredInTheZapp;
			},

			isLoginPending: function(){
				return !!(Capriza.LoginManager.getHostPendingLogin() || Capriza.LoginManager.getContextPendingLogin());
			},

			getHostPendingLogin: function(){
				return Utils.findKey(Capriza.LoginManager.loggedInHosts, function (loggedInHost) { return !loggedInHost });
			},

			getContextPendingLogin: function(){
				return Utils.findKey(Capriza.LoginManager.loggedInContexts, function (loggedInContext) { return !loggedInContext });
			},

			// overrides in designer (Designer.js)
			shouldPerformAutoLogin: function () {
				return true;
			},
			shouldSaveLoginPageCredentialsModel: function () {
				return true;
			},

			getSavedCredentialsForType: function (credentialsType, host) {
				var key = this._getIdentityLocalStorageKey(host),
				    identity = ClientCache.getItem(key),
				    decrypted = this._decryptCredentials(identity, key);

				if(decrypted && decrypted.loginVersion == this.LOGIN_VERSION){
					decrypted = decrypted[credentialsType];
					if(decrypted) decrypted = decrypted[host];
					if(decrypted) decrypted.loginVersion = this.LOGIN_VERSION;
				}

				return decrypted;
			},

			logOut: function(clearCredentials, reload){
				if (typeof clearCredentials === "undefined") {
					clearCredentials = true;
				}
				if (typeof reload === "undefined") {
					reload = true;
				}

				var authorizationCookiesMgr = typeof MBOOT === 'undefined' ? Capriza.AuthorizationCookiesMgr : MBOOT.AuthorizationCookiesMgr;
				authorizationCookiesMgr.clearCookies(); //todo: clear only the zapp specific cookies and not all
				if (clearCredentials) {
					Capriza.LoginManager.clearCredentials();
				}

				if (!reload) return;

				var msg = Capriza.translator.getText("signingOut");
				if (Capriza.cordova) {
					setTimeout(function () { Utils.reload(msg)}, 4000);
					Dispatcher.on('identity/host/logout/dataRemoved', function () { Utils.reload(msg) });
				}
				else Utils.reload(msg);
			},


			/////////////////////////////////////////////////////////////////////////////////////////////////////////
			/////////////////////////////////////////////////////////////////////////////////////////////////////////

			BUTTON_IDENTITY_KEY : "login_submit_button",
			CHECKBOX_IDENTITY_KEY : "login_save_credentials_checkbox",

			credentialsSavingAllowed:function(page){
				if (Capriza.LoginManager.loginPageView && Capriza.LoginManager.loginPageView.model.get("contextId") == page.get("contextId")){
					return Capriza.LoginManager.loginPageView._isSaveCredentialsChecked();
				} //else
				return !!page.getModelForIK(this.CHECKBOX_IDENTITY_KEY);
			},

			_verifySignOutVisibility: function(page){

				if(!Capriza.LoginManager.firstLoginCtx){
					Capriza.LoginManager.firstLoginCtx = page.get('contextId');
				}
				if(Capriza.LoginManager.firstLoginCtx == page.get('contextId')){
					Dispatcher.trigger("identity/removeSignOut");
				}else{
					Dispatcher.trigger("identity/addSignOut");
				}
			},

			renderLoginPageIfNeeded: function(loginPageModel){
				if(loginPageModel.shouldNotRender || !Capriza.Connection.isOnline) return;
				if ($('.context-page.active').length > 0 && !Utils.isCachedMVPShown()) return;
				Capriza.LoginManager.showLoginPage(loginPageModel, 'none');
				loginPageModel.shouldNotRender = true;
			},

			tryToPerformAutoLogin:function(page, transition){

				Logger.debug('[LOGIN] tryToPerformAutoLogin');
				var host = page.get('host'), autoLoginPerformed = false, self = this;

				function showAuthenticatingMsg(msg) {
					if (Capriza.splashing) {
						Capriza.splashRenderAuthMessage && Capriza.splashRenderAuthMessage(msg /*+host(pagesCount > 1 ? "Page "+pagesCount : "")*/, {fontColor: '#000000', isError: false});
						Dispatcher.trigger('splash/setTimeout');
					}
					else if(!Utils.isCachedBlueprintShown()){
						Utils.showMessage(msg, 4000);//TODO: it is hidden by loading
					}
				}

				if (this.credentialsSavingAllowed(page)) {
					this.sendMsgHandler = this.sendMsgHandler || function(message){
							Logger.debug('[LoginManager] auto login sendMsgHandler started - saving message: ' + message.responseType);
							Capriza.LoginManager.addMessageForBulk(message);
						};
					//We store all messages that were sent (we record login messages)
					Logger.debug('registering to sendMessages event for auto login');
					Dispatcher.off("sendMessage" , this.sendMsgHandler);
					Dispatcher.on("sendMessage" , this.sendMsgHandler);
				}


				self._verifySignOutVisibility(page);

				/////////////////////////////////////////
				var isSSO = Capriza.LoginManager.isPageSSO(page);
				var firstTry = !this.credentialsSavedForHosts[host];
				Capriza.LoginManager.loggedInHosts[host] = false;
				Capriza.LoginManager.loggedInContexts[page.get("contextId")] = false;
				Capriza.LoginManager.credentialsSavedForHosts[host] = false;
				Capriza.LoginManager.credentialsSavedForContexts[page.get("contextId")] = false;

				if(isSSO){
					//remove checkbox from model
					var checkboxModel = page.getModelForIK(self.CHECKBOX_IDENTITY_KEY);
					if(checkboxModel){
						checkboxModel.removeFromParent();
						delete page._identityKeysToModel[self.CHECKBOX_IDENTITY_KEY];
					}

					if(firstTry) {
						Logger.debug('tying airwatch sso');
						Capriza.Capp.mdm.getSsoCredentials(
							function success(awData) {
								Logger.debug("recieved airwatch SSO credentials");
								var SSOLoginModel = {
									AWSSO: true,
									username: {
										type: "textbox",
										text: awData.username
									},
									password: {
										type: "passwordbox",
										text: awData.password
									}
								};
								showAuthenticatingMsg(Capriza.translator.getText(Capriza.translator.ids.authenticating));
								self.performAutoLogin(SSOLoginModel, page);
							},
							function failure() {
								Logger.warn("[LoginManager] failed to get airwatch SSO credentials");
							});

						autoLoginPerformed = true;
					}
				}

				if(!isSSO) {//not used SSO
					var loginModel = this.getSavedCredentialsForType(this.credentialsTypes.IDENTITY_KEYS ,host);
					if (loginModel && this.credentialsSavingAllowed(page)) {

						showAuthenticatingMsg(Capriza.translator.getText(Capriza.translator.ids.authenticating));
						autoLoginPerformed = this.performAutoLogin(loginModel, page);
					}
					else {
						Logger.debug('[LoginManager] Not doing auto login');
					}
				}

				if(autoLoginPerformed){
					//!!! if we return a true, then the page will not be rendered and we need to handle events correctly.
					var render = function(){ Capriza.LoginManager.renderLoginPageIfNeeded(page); }
					Dispatcher.off("application/dialog/before", render);
					Dispatcher.once("application/dialog/before", render);
					Capriza.LoginManager.setAuthenticationTimeout(page);
				}
				else{
					page.shouldNotRender = true;
				}
				Capriza.LoginManager.autoLoginPerformed = autoLoginPerformed ? page.get("contextId") : false;
				return autoLoginPerformed;
			},

			performAutoLogin: function(loginModel, page) {
				var self = this,
				    valuesPopulated = false,
				    host = page.get('host');
				var identityKeys = page.getIdentityKeys();

				function setTextToModel(model, text){
					model.set('text', text);
					model.api.setText({value: text, auto: true});
					valuesPopulated = true;
				}

				function setPasswordToModel(model, text){
					model.set('text', text);
					model.api.setText({
						value: text,
						encrypt: true,
						auto: true
					});
					valuesPopulated = true;
				}

				function setSelectedIndexToModel(model,selectedIndex){
					model.api.setSelectedIndex({value: selectedIndex, auto: true});
					model.set("selectedIndex", selectedIndex);
					valuesPopulated = true;
				}

				function populateFieldFromModel(model, saved){
					switch(model.get("type")){
						case "textbox":
						case "combobox":
							setTextToModel(model,saved.text);
							break;
						case "passwordbox":{
							setPasswordToModel(model, saved.text);
							break;
						}
						case "listbox": {
							setSelectedIndexToModel(model,saved.selectedIndex);
							break;
						}
					}
				}

				function populateField(model, val){
					switch(model.get("type")){
						case "textbox":
							setTextToModel(model, val);
							break;
						case "passwordbox":{
							setPasswordToModel(model, val);
							break;
						}
						case "listbox": {
							setSelectedIndexToModel(model, val);
							break;
						}
					}
				}

				function populateLogin4Model(savedCred){
					var allPopulated =
						    identityKeys.every(function(ikey){
							    if(ikey == self.BUTTON_IDENTITY_KEY || ikey == self.CHECKBOX_IDENTITY_KEY) return true;
							    var model = page.getModelForIK(ikey),
							        saved = savedCred[ikey];
							    if(!model || !saved){
								    return false;
							    }
							    populateFieldFromModel(model, saved);
							    return true;
						    });
					return allPopulated;
				}

				if(loginModel.AWSSO || loginModel.loginVersion == this.LOGIN_VERSION){//SSO || V4
					valuesPopulated = populateLogin4Model(loginModel);
				}
				else if(identityKeys.length > 0 && _.filter(identityKeys,function(k){return k=="username"}).length > 0  && loginModel["username"] && (typeof loginModel["username"] === "string") ){
					//for login1 (backward) compatibility
					_.each(identityKeys,function(ikey){
						if(ikey == self.BUTTON_IDENTITY_KEY || ikey == self.CHECKBOX_IDENTITY_KEY) return;
						var model = page.getModelForIK(ikey),
						    val = loginModel[ikey];
						if(model && val){
							populateField(model, val);
						}
					});
				}

				if(valuesPopulated &&
					page.getModelForIK(self.BUTTON_IDENTITY_KEY) &&
					Capriza.LoginManager.shouldPerformAutoLogin() &&
					!this.credentialsSavedForHosts[host] ) {

					Dispatcher.trigger("login/autoLogin/start", page.get('contextId'));

					page.getModelForIK(self.BUTTON_IDENTITY_KEY).api.click({value: '', auto: true});

					this.credentialsSavedForHosts[host] = true;
					this.credentialsSavedForContexts[page.get("contextId")] = true;
					Logger.tag("autoLoginPerformed");
					return true;
				}
				else {
					Logger.debug('Not performing auto login. valuesPopulated: '+valuesPopulated+
						' page.getModelForIK(self.BUTTON_IDENTITY_KEY): '+JSON.stringify(page.getModelForIK(self.BUTTON_IDENTITY_KEY)));
				}

				return false;
			},

			showLoginPage: function(page, transition){
				Capriza.LoginManager.loginPageView && Capriza.LoginManager.loginPageView.destroy();
				Capriza.LoginManager.loginPageView = new Capriza.Views.LoginPage({model:page}).render();
				Capriza.LoginManager.loginPageView.show({ transition: transition });
			},

			autoLoginFailed: function(page){
				Capriza.LoginManager.showLoginPage(page, "none");
				Capriza.LoginManager.autoLoginPerformed = false;

				var loginContextId = page && page.get('contextId');
				if (loginContextId) {
					Dispatcher.trigger("login/autoLogin/failed", loginContextId);
				}
			},

			loginSuccess: function(){
				if (Capriza.LoginManager.autoLoginPerformed)
					Capriza.LoginManager.autoLoginSuccess();
				else
					Capriza.LoginManager.manualLoginSuccess();
			},

			manualLoginSuccess: function(){
				Logger.info("[LoginManager] login success!");
				Dispatcher.trigger("identity/addSignOut");

				var pendingHost = Utils.findKey(Capriza.LoginManager.loggedInHosts, function(loggedInHost){return !loggedInHost}),
				    pendingCtx = Utils.findKey(Capriza.LoginManager.loggedInContexts, function(loggedInCtx){return !loggedInCtx}),
				    pendingPage = Capriza.Model.PageDB[pendingCtx];

				if (pendingHost) Capriza.LoginManager.loggedInHosts[pendingHost] = true;

				if (pendingCtx) {
					Capriza.LoginManager.loggedInContexts[pendingCtx] = true;
					if (pendingHost) Capriza.LoginManager.credentialsSavedForHosts[pendingHost] = false;
					Capriza.LoginManager.credentialsSavedForContexts[pendingCtx] = false;

					//Probably successful login! (can/might be a separate error page or reset password)
					if (Capriza.LoginManager.credentialsSavingAllowed(pendingPage)) {
						Logger.debug("[LoginManager] saving credentials is allowed, saving credentials.");
						Capriza.LoginManager.saveLoginPageCredentialsModel(pendingPage);
					}
					else Logger.debug("[LoginManager] saving credentials is not allowed, NOT saving credentials.");
				}

				Logger.debug("[LoginManager] setting host " + pendingHost + (pendingCtx ? (", and ctx " + pendingCtx) : "") + " as logged in");
				Capriza.LoginManager.autoLoginPerformed = undefined; // clear the auto login flag
			},

			autoLoginSuccess: function(){
				Logger.info("[LoginManager] auto-login success!");
				var pendingPageCtxId = Utils.findKey(Capriza.LoginManager.loggedInContexts, function(loggedIntoCtx){return !loggedIntoCtx}),
				    pendingPage = Capriza.Model.PageDB[pendingPageCtxId];
				Logger.debug("[LoginManager] setting page ctxId " + pendingPageCtxId + " as successfull login");
				pendingPage.shouldNotRender = true;
				Capriza.LoginManager.manualLoginSuccess();
				if(!Capriza.LoginManager.credentialsSavingAllowed(pendingPage) && Capriza.LoginManager.isPageSSO(pendingPage)){
					Logger.debug("[LoginManager] (sso) credentials were saved to file");
					Capriza.LoginManager.writeCredentialsToFile();
				}

				Dispatcher.trigger("login/autoLogin/succeed", pendingPageCtxId);
			},

			isPageSSO: function(page){
				var inAWWrapper = !!Capriza.Capp && !!Capriza.Capp.mdm && !!Capriza.Capp.mdm.getSsoCredentials;
				var identityKeysAreDefault = !!page.getModelForIK("username") && !!page.getModelForIK("password");
				var AWEnabledAndSSOEnabled = window.appData && window.appData.uapp_org_mdm == "airwatch" && window.appData.config && !window.appData.config.disableAirwatchSSO;
				var isSSO = Capriza.device.ios && inAWWrapper && identityKeysAreDefault && AWEnabledAndSSOEnabled;

				return isSSO;
			},

			setAuthenticationTimeout: function(page){
				var config = window.appData && window.appData.config;
				var authenticatingTimeout = (config && config.displayAuthenticatingTimeout) || 60000;

				if(!Utils.isCachedBlueprintShown()) {
					var timer = setTimeout(function () {
						!page.shouldNotRender && Logger.warn("Authenticating message left on for over " + authenticatingTimeout + "ms, might be due to incorrect zap configuration. (failure scenario needs to be recorded in login page.)");
						Capriza.LoginManager.renderLoginPageIfNeeded(page);
					}, authenticatingTimeout);

					Dispatcher.once("loading/automationMessage", function () {
						clearTimeout(timer);
					});
				}
			},

			///////////////////////////////

			getLoginModelToStore: function(page){
				var self = this;
				var loginModelToStore = {};
				var identityKeys = page.getIdentityKeys();
				if(identityKeys.length > 0){
					identityKeys.forEach(function(ikey){
						if(ikey == self.BUTTON_IDENTITY_KEY || ikey == self.CHECKBOX_IDENTITY_KEY) return;
						loginModelToStore[ikey] = page.getModelForIK(ikey).toJSON();

					});
				}

				return loginModelToStore
			},

			validCredentials:function(page){
				return page.getIdentityKeys().some(function(ik){
					var model = page.getModelForIK(ik);
					return (model.get("type") == "textbox" || model.get("type") == "passwordbox") && model.get("text") && model.get("text").length > 0;
				});
			},

			writeCredentialsToFile: function () {
				Logger.debug('[LoginManager] writeCredentialsToFile started. bulk message collection length: ' + Capriza.LoginManager.messagesForBulk.length);

				if (Capriza.LoginManager.messagesForBulk.length == 0) {
					Logger.debug("[LoginManager] writeCredentialsToFile aborted! no messages for bulk to write");
					return;
				}

				var pendingContext = Capriza.LoginManager.getContextPendingLogin();
				if (pendingContext) {
					Logger.debug("[LoginManager] writeCredentialsToFile aborted! Context " + pendingContext + " is pending login, waiting for more message before writing to file");
					return;
				}

				Logger.debug('unregistering messages');
				Dispatcher.off("sendMessage", this.sendMsgHandler);

				var entireMessage = {type: "bulk", messages: Capriza.LoginManager.messagesForBulk};
				var encrypted = GibberishAES.enc(JSON.stringify(entireMessage), window.EncryptedCache.xkcd);
				var hosts = _.reduce(Capriza.LoginManager.credentialsSavedForHosts, function(savedHosts, credentialsSavedForHost, host){
					savedHosts = savedHosts || [];
					if (credentialsSavedForHost) savedHosts.push(host);
					return savedHosts;
				}, []);

				Logger.debug("[LoginManager] writeCredentialsToFile - writing hosts: " + hosts);

				Dispatcher.trigger('login/success', {encryptedLoginMessages: encrypted, hosts: hosts});

			},

			saveLoginPageCredentialsModel:function(page){
				if (!this.shouldSaveLoginPageCredentialsModel()) return;
				var host = page.get('host');
				if(!this.validCredentials(page))return;
				Logger.debug("[LoginManager] saveLoginPageCredentialsModel: credentials are valid");
				Capriza.LoginManager.credentialsSavedForContexts[page.get("contextId")] = true;
				var loginModelToStore = this.getLoginModelToStore(page);
				this.saveCredentialsForType(loginModelToStore, Capriza.LoginManager.credentialsTypes.IDENTITY_KEYS, host);

				if (Capriza.LoginManager.messagesForBulk.length > 0) {
					this.writeCredentialsToFile();
				}
				else {
					Logger.error('failed to write login msgs from auto-login');
				}
			},

			clearLoginState: function () {
				Capriza.LoginManager.loggedInHosts = {};
				Capriza.LoginManager.loggedInContexts = {};
				Capriza.LoginManager.autoLoginPerformed = false;
				Capriza.LoginManager.credentialsSavedForHosts = {};
				Capriza.LoginManager.credentialsSavedForContexts = {};

			},

			addMessageForBulk: function(message){
				Capriza.LoginManager.messagesForBulk.push (message);
			}
		};

		Dispatcher.on ("mobile/login/success", Capriza.LoginManager.loginSuccess);
		Dispatcher.on ("login/auto/failed", Capriza.LoginManager.autoLoginFailed);
		Dispatcher.on("identity/host/logout", Capriza.LoginManager.logOut);
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/login/LoginPage.js

try{
	/**
	 * Created with JetBrains WebStorm.
	 * User: oriharel
	 * Date: 1/20/14
	 * Time: 12:22 PM
	 * To change this template use File | Settings | File Templates.
	 */
	;(function() {

		Capriza.Views.LoginPage = Capriza.Views.ContextPage.extend({

			initialize: function() {

				Capriza.Views.ContextPage.prototype.initialize.apply(this, arguments);

				var self = this;

				this.model.on("page/controlModified", function(controlId) {
					var view = self.getView(controlId);
					if(view.model.get("identityKey")){
						view.$el.attr("data-identitykey",view.model.get("identityKey"));
					}
				});

			},

			getIKView: function(ik){
				var model = this.model.getModelForIK(ik);
				var id = model && model.get("id");
				return id && this.getView(id);
			},

			getFilteredKeys:function(){
				var identityKeys = this.model.getIdentityKeys();
				var ret = {};
				identityKeys.forEach(function(ikey){
					if(ikey != Capriza.LoginManager.BUTTON_IDENTITY_KEY && ikey != Capriza.LoginManager.CHECKBOX_IDENTITY_KEY){
						ret[ikey] = ikey;
					}
				});
				return ret;
			},

			_isSaveCredentialsChecked: function(){
				return this.getIKView(Capriza.LoginManager.CHECKBOX_IDENTITY_KEY) && this.getIKView(Capriza.LoginManager.CHECKBOX_IDENTITY_KEY).getChecked();
			},

			_setSaveCredentialsChecked: function(val){
				var IKView = this.getIKView(Capriza.LoginManager.CHECKBOX_IDENTITY_KEY);

				if (IKView) {
					IKView.setChecked(!!val);
					IKView.model.set("checked", !!val);
				}
			},


			_render: function() {
				Logger.debug('rendering login page');
				Capriza.Views.ContextPage.prototype._render.apply(this, arguments);

				var host = this.model.get('host');
				var self = this;
				var IKView = this.getIKView(Capriza.LoginManager.CHECKBOX_IDENTITY_KEY);


				if(IKView){

					var config = window.appData && window.appData.config;
					if (!config || config && !config.dontSaveCredentialsByDefault){
						this._setSaveCredentialsChecked(true);
					}
				}



				$('input[type="password"]', this.$el).on('keypress', function(e) {
					if (e.which === 13) {
						$(this).blur();
						self.getIKView(Capriza.LoginManager.BUTTON_IDENTITY_KEY) && self.getIKView(Capriza.LoginManager.BUTTON_IDENTITY_KEY).model.api.click();
					}
				});

				self.model.getIdentityKeys().forEach(function(ikey){
					//var view = self.getIKView(ikey);
					//var $elm = view && view.$el;
					//$elm && $elm.attr("data-identitykey",ikey);
					self.getIKView(ikey).$el.attr("data-identitykey",ikey);
				});

				if(self.getIKView(Capriza.LoginManager.BUTTON_IDENTITY_KEY) && self.getIKView(Capriza.LoginManager.BUTTON_IDENTITY_KEY).$el.hasClass("identity-demo-submit-btn")) {
					//seek attention
					setTimeout(function () {
						$(".identity-demo-submit-btn", self.$el).toggleClass("animated tada")
					}, 2000);
					clearInterval(this.attentionSeekInterval);
					this.attentionSeekInterval = setInterval(function () {
						$(".identity-demo-submit-btn", self.$el).toggleClass("animated tada")
					}, 4000);
				}

				//set the first context as the login only when rendering the page (auto-login is not the first context the user sees)
				this.model.verifyLoginAsFirstContext && this.model.verifyLoginAsFirstContext();

				Capriza.LoginManager.loginPageView = this;

			}

		});

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/EngineApi.js

try{
	;
	(function () {
		Capriza.EngineApi = {

			holdMessages:false,
			unsyncedMessages:false,
			messages : [],

			Actions: {
				textbox: ["setText", "submit"],

				autocomplete: ["setText", "blur", "selectItem"],

				button: ["click"],

				bubble: ["click"],

				clickAction: ["click"],

				checkbox: ["setChecked"],

				combobox: ["setText", "openPopup", "selectMenuItem", "closePopup"],

				content: ["clickInternalLink"],

				calendarInput: ["setDates", "nextMonth", "prevMonth"],

				datepickerInput: ["setDate"],

				calendarButton: ["setDates", "nextMonth", "prevMonth"],

				datepickerButton: ["setDate"],

				file: ["setFile"],

				group: ["next", "previous", "setPage", "getMoreItems", "doAction", "setIsSelected"],

				groupSelector: ["setIsSelected"],

				image_link: ["click"],

				link: ["click"],

				listbox: ["setSelectedIndex"],
				listboxmulti: ["setSelectedIndex"],

				radiogroup: ["setSelectedIndex"],

				lookup: ["setText", "openList"],

				menu: ["selectMenuItem"],

				popup: ["openPopup", "closePopup", "selectMenuItem"],

				record: ["setIsSelected", "doAction"],

				"image-with-2-text-group": ["setIsSelected", "doAction"],

				action: ["click"],

				onoffswitch3: ["setOn", "setOff"],

				"list-tree": ["fetchBranch", "setSelectedItem"]
			},

			sendEvent: function (contextId, controlId, action, data) {
				var event  =  {
					type: "mcAction",
					controlId: controlId,
					contextId: contextId,
					action: action
				};

				var mobileEvent = _.clone(event);
				_.extend(event, data);

				if(data.encrypt) {
					data.value = "******";
				}

				Logger.debug("sending event "+JSON.stringify(_.extend(mobileEvent, data)));

				Dispatcher.trigger('sendMessage', event, event.controlId);
				Capriza.pageTimer = Date.now();

				if(Capriza.EngineApi.unsyncedMessages && event.type == "mcAction" && !event.auto){//TODO: ignore some messages types like snapshot
					pageManager.addMobId(event);
					var model = Capriza.Model.Control.getById(controlId);
					var etaActions = model.get("eta"), etaAction = etaActions && etaActions[event.action], isETABlocking = etaAction && etaAction.blocking;

					if(model.get("detachMode") && isETABlocking){
						event.ackRequired = true;
						var msg = { type: "progress" };
						Utils.showUnimessage(msg, true, true, !etaAction.maxAutomations);

						// Capriza.Toast.show({textMajor: Capriza.translator.getText(Capriza.translator.ids.waitingFor) + domain + "...",
						//     toastIconClass: "rotating icon-loading", blockUI:true});
						Capriza.EngineApi.messages.blockingMsg = {
							msgId:      event.msgId,
							controlId:  controlId,
							action:     action
						};

						function ackRecieved(data){
							if(!Capriza.EngineApi.messages.blockingMsg || extractIdNumber(data.msgId) <= extractIdNumber(Capriza.EngineApi.messages.blockingMsg.msgId)) return;
							if(Utils.isUnimessageShown()){
								// if(Capriza.Toast.isBlocking()){
								if (Utils.isBlockingUnimessage) {
									var blockingMsg = Capriza.EngineApi.messages.blockingMsg ;
									var control = Capriza.Model.ControlDB[blockingMsg.controlId];
									var etaActions = control.get("eta"), etaAction = etaActions && etaActions[blockingMsg.action];
									etaLoadingState = { msgId : blockingMsg.msgId, blocking : etaAction.blocking };
									if(etaAction){
										var loadingStopBlocking = function(){
											Utils.unblockUnimessage();
											// Capriza.Toast.unblock();
										};
										var loadingStop = function(){
											// Capriza.Toast.hide();
											Utils.hideUnimessages();
											Dispatcher.off("loading/stopBlocking", loadingStopBlocking);
											Dispatcher.off("loading/stop", loadingStop);
										};
										if(etaAction.blocking){
											// Stay Blocking
											Dispatcher.once("loading/stopBlocking", loadingStopBlocking);
										}
										else if(etaAction.nonBlocking){
											Utils.unblockUnimessage();
											// Capriza.Toast.unblock();
										}
										else { // No eta
											// Capriza.Toast.hide();
											Utils.hideUnimessages();
										}

										if(etaAction.nonBlocking || etaAction.blocking){
											Dispatcher.on("loading/stop", loadingStop);
										}
									}
									else { // No eta
										// Capriza.Toast.hide();
										Utils.hideUnimessages();
									}
								}
								else{
									// Capriza.Toast.hide();
									Utils.hideUnimessages();
								}
							}
							Capriza.EngineApi.messages.blockingMsg = undefined;
							Dispatcher.off("message/ack", ackRecieved);
						}

						Dispatcher.on("message/ack", ackRecieved);
					}

					event.deferred = true;
					if (Capriza.EngineApi.canSendMessages)
						pageManager.triggerEvent(event);
					else
						Capriza.EngineApi.messages.push(event);
				}
				else {
					pageManager.triggerEvent(event); // TODO(amit): move pageManager.triggerEvent to EngineApi.sendEvent after versioning task ends
					etaHandler.apply(this, [event.msgId].concat(Array.prototype.slice.call(arguments)));
				}
			}
		};

		Capriza.EngineApi.Actions.list = Capriza.EngineApi.Actions.group;
		Capriza.EngineApi.Actions.table = Capriza.EngineApi.Actions.group;
		Capriza.EngineApi.Actions.tabular = Capriza.EngineApi.Actions.group;
		Capriza.EngineApi.Actions.table2 = Capriza.EngineApi.Actions.group;
		Capriza.EngineApi.Actions.passwordbox = Capriza.EngineApi.Actions.textbox;

		function etaHandler(msgId, contextId, controlId, action, data) {
			var control = Capriza.Model.ControlDB[controlId];
			if (!control) return;

			var etaActions = control.get("eta"), etaAction = etaActions && etaActions[action];
			if (!etaAction) return;

			etaLoadingState = {};
			if (etaAction.blocking === true || etaAction.nonBlocking === true) {
				etaLoadingState = { msgId : msgId, blocking : etaAction.blocking };
				if (etaAction.blocking) {
					Logger.debug("ETA Handler showing blocking loading");
					Utils.loadStartTimer && clearTimeout(Utils.loadStartTimer);
					Utils.loadStartTimer = setTimeout(function() { Dispatcher.trigger("loading/start", {waitForNewPage: etaAction.waitForNewPage, maxAutomations: etaAction.maxAutomations}); }, 0);
					$.capriza.showLoadingMsg(undefined, { duration : null });
				} else if (etaAction.nonBlocking) {
					Logger.debug("ETA Handler showing non blocking loading");
//				$.capriza.showLoadingMsg(true, { duration : null });
					Utils.loadStartTimer && clearTimeout(Utils.loadStartTimer);
					Utils.loadStartTimer = setTimeout(function() { Dispatcher.trigger("loading/start", {nonBlocking: true, waitForNewPage: etaAction.waitForNewPage, maxAutomations: etaAction.maxAutomations}); }, 0);
				}
			}
		}

		function extractIdNumber(msgId) {
			msgId = /mob(-?\d+)/.exec(msgId || "");
			return Number((msgId && msgId[1]) || undefined);
		}

		Dispatcher.on("engine/message", function(response) {


			if(Utils.isCachedBlueprintShown() && response.structure && response.structure[0].login) return;
			if(Capriza.EngineApi.messages.blockingMsg) return;
			if (response.resultType === 'loading' || response.resultType === 'snapshot' || response.resultType === 'dataStoreWrite'|| response.resultType === 'tiles' || response.stopBlocking === false) return;

			var responseId = extractIdNumber(response.effectiveMobileMsgId), loadingStateId = extractIdNumber(etaLoadingState.msgId);
			if (isNaN(responseId) || isNaN(loadingStateId) || loadingStateId <= responseId) {
				Logger.debug("engine message --> hide loading and stop blocking, loadingStateId:" + loadingStateId + " responseId:" + responseId);
				Dispatcher.trigger("loading/stop");
				$.capriza.hideLoadingMsg();
				Utils.hideUnimessages();
			} else if (!etaLoadingState.blocking) {
				Logger.debug("engine message --> stop blocking");
				Dispatcher.trigger("loading/stopBlocking");
				Utils.unblockUnimessage();
			}
		});

		Dispatcher.on("engineApi/unsyncedMessages", function(value){
			Capriza.EngineApi.unsyncedMessages = value;
		});

		Capriza.EngineApi.canSendMessages = false;
		Dispatcher.on("security/ready", function(){
			////Login with bulk for time saving
			//var loginBulk = Capriza.LoginManager.getLoginMessages();
			//if(loginBulk) {
			//    pageManager.triggerEvent(SharedUtils.getBulkMsg(loginBulk.messages.map(function(msg){
			//        return pageManager.addMobId(msg)
			//    })));
			//    Capriza.LoginManager.loginBulkSent = true
			//}

			Capriza.EngineApi.canSendMessages = true;
			if(Capriza.EngineApi.messages.length > 0) {
				Capriza.EngineApi.messages.forEach(function(msg){ pageManager.triggerEvent(msg); });
				Capriza.EngineApi.messages = [];
			}
		});


		etaLoadingState = {};

//    performance monitoring

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/Control.js

try{
	(function() {

		if (!Capriza.Model) {
			Capriza.Model = {};
		}


		var ApiImpl = {
			getImpl: function(model) {
				var impl = ApiImpl[model.get("type")];
				if (impl) return new ApiImpl[model.get("type")](model);
			}
		};

		function createApiImpl(type) {
			ApiImpl[type] = function(model) {
				this.model = model;
			};

			_.each(Capriza.EngineApi.Actions[type], function(action) {
				ApiImpl[type].prototype[action] = function(value) {
					var controlId = this.model.get("id");

					if (this.model.get("isPhantom")) {
						Logger.info("Not sending event for phantom: " + controlId);
						return;
					}

					var data = (_.isObject(value) && value.hasOwnProperty("value")) ? value : { value: value };
					Capriza.EngineApi.sendEvent(this.model.getContextId(), controlId, action, data);

				};
			});
		}

		Object.keys(Capriza.EngineApi.Actions).forEach(createApiImpl);

		var Control = Capriza.Model.Control = Backbone.Model.extend({
			initialize: function(attributes, options) {
//            Logger.debug("initializing control: " + JSON.stringify(this.toJSON()));
				var controls = this.get("controls"), self = this;
				self.parent = options && options.parent;
				self.pages = options && options.pages;
				if (controls) {
					this.set("controls", controls.map(function(c) {
						c.pages = self.pages;
						if (c instanceof Backbone.Model) {
							return c;
						}
						else {
							return new Control(c, { parent: self});
						}
					}));
				}
				this.api = ApiImpl.getImpl(this);


				// styleSetIds cache
				var ssIds = this.get("styleSetIds"),
				    mcKey = (this.get("mcTemplId") || this.get("id")) + (this.get("isBox") ? "box" : "");
				if (ssIds) Capriza.Model.StyleSetDB[mcKey] = ssIds;
				else if (Capriza.Model.StyleSetDB[mcKey]) this.set("styleSetIds",Capriza.Model.StyleSetDB[mcKey]);
				else Logger.warn("No StyleSets in message for " + this.get("id") + " and in cache for key " + mcKey);

				if (this.get("click") && !(this.get("click") instanceof Backbone.Model)) {
					this.set("click", new Control(this.get("click"), { parent: this, pages: this.pages }));
				}

				if (this.get("groupHeader") && !(this.get("groupHeader") instanceof Backbone.Model)) {
					this.set("groupHeader", new Control(this.get("groupHeader"), { parent: this, pages: this.pages }));
				}

				if (!(options && options.dontCache)) {
					Capriza.Model.ControlDB[this.get("id")] =  this;
				}

				Dispatcher.trigger("control/created", this);
			},

			set: function(key, value, options) {

				if (typeof key == "object"){
					options = value;
				}
				if (key.controls){

					for (var i  = 0; i < key.controls.length; i++){
						key.controls[i] = new Control(key.controls[i], {parent: this});
						key.controls[i].addPage(this.pages);
					}
				}

				if (key.click && !(key.click instanceof Backbone.Model)) {
					key.click = new Control(key.click, { parent: this, pages: this.pages });
				}

				if (key.groupHeader && !(key.groupHeader instanceof Backbone.Model)) {
					key.groupHeader = new Control(key.groupHeader, { parent: this, pages: this.pages });
				}

				Backbone.Model.prototype.set.apply(this, arguments);
//            Logger.debug('invoking controlChanged for key='+key+' value='+value+' options='+options);
				var self = this;
				//this.pages = this.pages || this.get('pages');
				_.each(this.pages, function(page) {
					var data;
					if (_.isObject(key) || key == null) {
						data = key
					} else {
						data = {};
						data[key] = value;
					}
					if (!options || !options.silent) {
						page.controlChanged(self, data);
					}
				});
			},

			setControls: function(controls) {
				for (var i  = 0; i < controls.length; i++){
					var existingControl = Capriza.Model.Control.getById(controls[i].id);
					if (existingControl) {
						var subcontrols = controls[i].controls;
						delete controls[i].controls;
						existingControl.set(controls[i]);
						subcontrols && existingControl.setControls(subcontrols);
						existingControl.api = ApiImpl.getImpl(existingControl);
						controls[i] = existingControl;
					}
					else {
						controls[i] = new Control(controls[i], {parent: this});
					}
					controls[i].addPage(this.pages);
				}

				Backbone.Model.prototype.set.call(this, "controls", controls);

				var self = this;
				_.each(this.pages, function(page) {
					page.controlChanged(self, { controls: controls });
				});
			},

			toJSON: function() {
				var ret = Backbone.Model.prototype.toJSON.call(this);

				if (ret.controls) {
					ret.controls = ret.controls.map(function(c) { return c.toJSON(); });
				}

				return ret;
			},

			addPage: function(page) {
				if (!page) return;
				function doAddPage(p) {
					if (self.pages){
						if (self.pages.indexOf(p) === -1) {
							self.pages.push(p);
						}

					} else {
						self.pages = [ p ];
					}
				}


				var self = this;
				if (!_.isArray(page)) page = [ page ];
				_.each(page, function(p) {
					doAddPage(p);
				});

				var controls = this.get("controls");
				if (controls) {
					_.each(controls, function(innerControl) {
						innerControl.addPage(page);
					});
				}

				var clickControl = this.get("click");
				if (clickControl) clickControl.addPage(page);

				var groupHeader = this.get("groupHeader");
				if (groupHeader) groupHeader.addPage(page);
			},

			getTablesInGroup: function() {
				var result = [];

				if (this.get('controls')) {
					this.get("controls").forEach(function(control) {
						if (/table|tabular/.test(control.get('type'))) {
							result.push(control.get('id'));
						}
						result = result.concat(control.getTablesInGroup());
					});
				}

				return result;
			},

			removePage: function(page) {
				if (this.pages) {
					var index = this.pages.indexOf(page);
					if (index > -1) {
						this.pages.splice(index, 1);
					}
				}

				var controls = this.get("controls");
				if (controls) {
					_.each(controls, function(innerControl) {
						innerControl.removePage(page);
					});
				}
			},

			remove: function() {
				recursiveRemove(this);
			},

			removeFromParent : function(){
				var self =this;
				if (self.parent) {
					var parent = self.parent;
					var parentControls = parent.get("controls"), index = parentControls.map(function(c) { return c.get("id") }).indexOf(self.get("id"));
					parentControls.splice(index, 1);
				}
				this.removeFromContext();
			},

			getContextId: function() {
				var contextId = "", pageId = "";

				function getPageContextId(pg){
					if(pg.get("contextId")) {
						return pg.get("contextId");
					}
					else if(pg.get('parentPage')){
						return getPageContextId(pg.get('parentPage'));
					}
					else{
						return undefined;
					}
				}

				if(this.pages){
					var pages = this.pages;
					_.each(pages, function(page) {
						var ctxId = getPageContextId(page);
						if (contextId==="" && ctxId) {
							contextId = ctxId;
						}
						pageId = page.get("id");
					});
				}
				else {//TODO: should add this also ?????????????????
					contextId = this.parent ? this.parent.getContextId() : "";
				}

				if (contextId === "" && pageId != "context-not-found") {
					Logger.error('ERROR, there is no context id associated to this control ', undefined, "controlModel", "Control id: " + this.get('id'));
				}
				return contextId;
			},

			removeFromContext: function() {
				var self = this;
				_.each(this.pages, function(page) {
					page.removeControl(self.get("id"));
				});
				delete Capriza.Model.ControlDB[this.get("id")];
			},

			compare: function(otherControl) {

				var toJson = this.toJSON(), otherJson = otherControl.toJSON();

				if (toJson.drillPage || otherJson.drillPage) {

					var thisDrillPageJson = toJson.drillPage, otherDrillPageJson = otherJson.drillPage;
					delete toJson.drillPage;
					delete otherJson.drillPage;
				}

				return JSON.stringify(toJson) === JSON.stringify(otherJson);
			},

			isInControl : function(control) {
				var foundId = false,
				    current = this;

				while (!foundId && current) {
					foundId = current.get('id') === control.get('id');
					current = current.parent;
				}
				return foundId;
			}

		}, {
			getById: function(id) {
				return Capriza.Model.ControlDB[id];
			},

			createApi: function(type, baseType, methods) {
				if (arguments.length === 2) {
					methods = Capriza.EngineApi.Actions[baseType];
				} else {
					methods = Capriza.EngineApi.Actions[baseType].concat(methods)
				}

				Capriza.EngineApi.Actions[type] = methods;
				createApiImpl(type);
			}
		});

		function recursiveRemove(control) {

			if (control.get('controls')) {
				for (var i = 0; i < control.get('controls').length; i++){
					recursiveRemove(control.get('controls')[i]);
				}
			}


			delete Capriza.Model.ControlDB[control.get('id')];
		}

		Capriza.Model.ControlDB = {};

		Capriza.Model.StyleSetDB = {};

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/State.js

try{
	/**
	 * Created by omer on 9/2/16.
	 */
	;(function() {

		var getText = Capriza.translator.getText.bind(Capriza.translator);

		Capriza.Views.BlueprintPageView = Capriza.Views.ContextPage.extend({

				expiredHandler: undefined,
				blueprintTimeout: undefined,

				initialize: function() {
					var self = this;
					Capriza.Views.ContextPage.prototype.initialize.apply(this, arguments);

					this.blueprintTimeout = ClientCache.getItem(Capriza.Views.MVPageView.zappDataKey+Capriza.getToken()+'-timeout') || 60000;
					this.$el.addClass("blueprint");

					Dispatcher.on('app/newVersionDownloading', function() {
						var msg = {type: "progress",
							messageText: getText("newVersion"),
							detailText: getText("zappReloadAuto")};

						self.mvpLoadingMessageTimeout = setTimeout(function(){
							Utils.shouldShowLoadingOnMVP(true);
						}, 3000);
						Utils.showUnimessage(msg, false, true);
					});

					Dispatcher.on("app/offline", this._onOffline, this);
					Dispatcher.on("app/online", this._onOnline, this);
					Dispatcher.on("app/disabledControlInteracted", this._onOnline, this);
					_.bindAll(this, "rearmBlueprintTimeOut", "clearBlueprintTimeOut");
				},

				clearBlueprintTimeOut: function () {
					if (this.expiredHandler) clearTimeout(this.expiredHandler);
				},

				rearmBlueprintTimeOut: function() {
					Logger.debug('arming blueprint timeout');
					this.clearBlueprintTimeOut();
					this.expiredHandler = setTimeout(function() {
						Logger.error('[Blueprint] blueprintTimerExpired triggered', undefined, "blueprint");
						Dispatcher.trigger('blueprintTimerExpired', {cause: "blueprintTimerExpired"});
					}, this.blueprintTimeout);
				},

				// Cancels Blueprint updating timeout and shows Offline-toast
				_onOffline: function () {
					Logger.debug("Blueprint offline");
					this.clearBlueprintTimeOut();

					var msg = {type: "error",
						messageText: getText("mvpOffline"),
						actionText: getText("gotIt"),
						action: Utils.hideUnimessages.bind(Utils)};

					Utils.showUnimessage(msg, false, true);
				},

				// Starts MVP updating timeout and shows Updating-toast
				_onOnline: function (force) {
					var self = this;
					Logger.debug("Blueprint online");
					this.rearmBlueprintTimeOut();

					if (force) {
						var s = getText("mvpUpdating");
						var t = getText("lastUpdated") + " " + this.lastUpdateDate;

						if (Utils.blockEffect()){
							return;
						}
						Utils.showUnimessage(
							{type: "progress"},
							false, true);
						clearTimeout(this.mvpUpdatingTimeout);
						this.mvpUpdatingTimeout = setTimeout(function(){
							// if unimassage is still display show this
							Utils.updateUnimessage(
								{type: "progress", messageText: s, detailText: t},
								false, true, true);
							// if after another 3 seconds still need to display messages show the loading automated messages
							clearTimeout(self.mvpLoadingMessageTimeout);
							self.mvpLoadingMessageTimeout = setTimeout(function(){
								Utils.shouldShowLoadingOnMVP(true);
							}, 4000);
						}, 6000);
					}
				},

				_render: function() {
					Capriza.Views.ContextPage.prototype._render.apply(this, arguments);
					Dispatcher.trigger("mobile/active");
					Dispatcher.trigger("engineApi/unsyncedMessages", true);

					var errorCallback = function(data) {
						Dispatcher.off('application/contextNotFound blueprintTimerExpired handleResponseError', errorCallback, this);
						Logger.tag("BlueprintError");
						Logger.error('Blueprint update Error received', undefined, "blueprint", JSON.stringify(data));

						var messageText = getText("somethingIsWrong");
						var detailText = getText("couldNotUpdatePage");
						var actionText = getText("retry");

						var msg = {type: "error", messageText: messageText,
							detailText: detailText, actionText: actionText,
							action: Utils.reload};

						Utils.showUnimessage(msg, false, true);
					};

					Dispatcher.on('application/contextNotFound blueprintTimerExpired handleResponseError', errorCallback, this);

					var timestamp = this.model.get('timestamp');
					moment.locale(Capriza.translator.getLang());
					var momentDate = moment(parseFloat(timestamp));
					this.lastUpdateDate = momentDate.fromNow();

					Logger.debug('showing blueprint from: ' + this.lastUpdateDate);

					var _this = this;

					Logger.debug("[Blueprint] starting the expiration timer");

					if (Capriza.Connection.isOnline) {
						this._onOnline(this.model.get("cacheShowLoading"));
					} else {
						this._onOffline();
					}
					this.rearmBlueprintTimeOut();

					Dispatcher.on('blueprint/newContentReady', function (options) {
						Logger.debug("received blueprint/newContentReady");
						_this.clearBlueprintTimeOut();

						_this.$el.removeClass("blueprint");
						Dispatcher.trigger("engineApi/unsyncedMessages", false);
						Dispatcher.off("app/offline", _this._onOffline);
						Dispatcher.off("app/online", _this._onOnline);
						Dispatcher.off("app/disabledControlInteracted", this._onOnline);
						Dispatcher.off('application/contextNotFound blueprintTimerExpired handleResponseError', errorCallback, _this);
						clearTimeout(_this.mvpUpdatingTimeout);
						clearTimeout(_this.mvpLoadingMessageTimeout);
						Utils.shouldShowLoadingOnMVP(false);
						if (this.model.get("cacheShowLoading")) Utils.hideUnimessages();

						if(options && options.newOnlinePageView) {
							options.newOnlinePageView.show({ transition: 'none' });
						}
					}, this);

					Dispatcher.trigger("mobile/blueprint/rendered");

					return this;
				}
			}
		);

		var _defaultControlStateProps = ["id", "type"];
		var _excludeStateProps = ["controls","styleSetIds", "eta"];
		var _defaultControlStructureProps = ["id", "type", "styleSetIds", "eta"];

		var caprizaToken = Capriza.getToken(),
		    structKeyPref = "struct-" + caprizaToken + "-",
		    stateKeyPref = "state-" + caprizaToken + "-",
		    defaultStructKey = structKeyPref + "default",
		    modelToken = "modelId-" + caprizaToken;

		var maxStructsPerZapp = 10,
		    maxStatesPerPage = 20,
		    statesPerPage = {};

		Capriza.Model.State = {

			controlStateProps:{
				content:    ["value"],
				textbox:    ["text"],
				listbox:    ["items", "selectedIndex"]
			},

			extractState:function(ctxId){
				var page = Capriza.Model.ContextPage.getByContextId(ctxId);
				if(!page) {
					Logger.error("Failed to extract state, page not found.", undefined, "State", "ctxId:" + ctxId );
					return;
				}
				var retState = {
					contextId: ctxId,
					controls:{}
				};

				function processControlsDFS(controls, pos){
					if(!controls) return;
					pos = pos || "0";
					controls.forEach(function(ctrl, idx){
						var subPos = pos + "-" + idx;
						if (!(ctrl instanceof Backbone.Model)) { // TODO <- do this better
							ctrl = Capriza.Model.Control.getById(ctrl);
						}
						retState.controls[ctrl.get("id")] = getControlState(ctrl);
						retState.controls[ctrl.get("id")].pos = subPos;
						processControlsDFS(ctrl.get("controls"), subPos);
					});
				}

				//ForDebugging
				function processControlsBFS(controls){
					if(!controls) return;
					var queue = controls;
					while(queue.length > 0){
						var ctrl = queue.shift();
						if (!(ctrl instanceof Backbone.Model)) { // TODO <- do this better
							ctrl = Capriza.Model.Control.getById(ctrl);
						}
						retState.controls[ctrl.get("id")] = getControlState(ctrl);
						ctrl.get("controls") && ctrl.get("controls").forEach(function(subctrl){
							queue.push(subctrl);
						});
					}

				}

				function getControlState(ctrl){
					//var controlState = {};
					//_defaultControlStateProps.forEach(function(prop){
					//    controlState[prop] = ctrl.get(prop)
					//});
					//
					//Capriza.Model.State.controlStateProps[ctrl.get("type")] && Capriza.Model.State.controlStateProps[ctrl.get("type")].forEach(function(prop){
					//    if(ctrl.get(prop)) {
					//        controlState[prop] = ctrl.get(prop)
					//    }
					//});

					var controlState = _.clone(ctrl.attributes); //TODO: filter to include only dynamics ? or by flag/flavor
					_excludeStateProps.forEach(function(prop){
						delete controlState[prop];
					});
					return controlState;
				}

				var pageControls = page.get("controls");

				processControlsDFS(pageControls);

				return retState;
			},

			saveState: function(ctxId, state) {
				if(!sm.structs[ctxId]) return;

				var stateId = (state && state.stateId) || "default";
				// save state only for pages with state cacheMode=persist
				var cacheStateMode = Utils.getCacheModes(sm.structs[ctxId].cacheMode).stateMode;
				//#20264 - allways save the last state of the login, we might need it in case of failed auto-login
				if (/^(persist|session)$/.test(cacheStateMode) || sm.structs[ctxId].login) {
					sm.states[ctxId] = sm.states[ctxId] || {};
					sm.statesUpdated[ctxId] = sm.statesUpdated[ctxId] || {};

					//check if we need to save the state before or after (default) user interaction
					//we save states that were updated at least once in the current run in sm.statesUpdated
					if (sm.statesUpdated[ctxId][stateId] && sm.structs[ctxId].cacheOnlyBeforeInteraction){
						Logger.info("Blueprint saveState: cacheOnlyBeforeInteratcion = 'true' and state '" + stateId + "' already updated in ctx '"+ ctxId +"'. Not overriding state.");
						return;
					}

					sm.states[ctxId][stateId] = sm.states[ctxId][stateId] || {};
					sm.statesUpdated[ctxId][stateId] = true;

					//set all of the new state's (EXCEPT "controls") properties to the old state (override)
					Object.keys(state).forEach(function (propKey) {
						if (propKey != "controls"){
							sm.states[ctxId][stateId][propKey] = state[propKey];
						}
						else{ //prop key == "controls":

							//make sure current state has "controls"
							sm.states[ctxId][stateId].controls = sm.states[ctxId][stateId].controls || {};

							//update each control: if it's a "diff" message, deep-extend the control's state.
							//if it's not a "diff" message ("missing" or "table") override the state, NOT extend.
							Object.keys(state.controls).forEach(function (controlId){
								var control = Capriza.Model.Control.getById(controlId);

								//special case 1 - "table": not a diff/incremental message, requires special treatment
								if (control && control.get("type") == "table"){
									sm.states[ctxId][stateId].controls[controlId] = sm.states[ctxId][stateId].controls[controlId] || {};

									//In case it's "moreItems", extend the table controls with "moreItems" controls
									if (state.controls[controlId].hasOwnProperty("moreItems") && state.controls[controlId].moreItems.controls){
										//var tableChildControls = sm.states[ctxId][stateId].controls[controlId].controls || [];
										//sm.states[ctxId][stateId].controls[controlId].controls = tableChildControls.concat(state.controls[controlId].moreItems.controls);

										//todo
									}
									//if the table message is not "moreItems", override the entire table state
									else {
										sm.states[ctxId][stateId].controls[controlId] = state.controls[controlId];
									}
								}
								//special case 2 - "isMissing": if the control is missing, we need to override the state
								else if (state.controls[controlId].missing){
									sm.states[ctxId][stateId].controls[controlId] = state.controls[controlId];
								}
								//default case: deep extend the current state with the new one assuming the message is a "diff"/incremental message
								else {
									sm.states[ctxId][stateId].controls[controlId] = sm.states[ctxId][stateId].controls[controlId] || {};
									$.extend(true, sm.states[ctxId][stateId].controls[controlId], state.controls[controlId]);
								}
							});
						}
					});

					//update timestamp
					sm.states[ctxId][stateId].pageProps = sm.states[ctxId][stateId].pageProps || {};
					sm.states[ctxId][stateId].pageProps.timestamp = Date.now();

					//$.extend(true, sm.states[ctxId][stateId], state);
					// mark states to persist according to maxStates per page
					statesPerPage[ctxId] = statesPerPage[ctxId] || [];
					if(stateId !== "default" && statesPerPage[ctxId].indexOf(stateId) < 0) {
						if(statesPerPage[ctxId].length >= maxStatesPerPage ) {
							statesPerPage[ctxId].shift();
						}
						statesPerPage[ctxId].push(stateId);
					}
				}
				if (sm.readyForCaching && (cacheStateMode === "persist" || stateId !== "default")) {
					var statesToPersist = {};
					Object.keys(sm.states).forEach(function(ctxId){
						var currentState = sm.states[ctxId],
						    cacheModes = sm.structs && sm.structs[ctxId] && Utils.getCacheModes(sm.structs[ctxId].cacheMode),
						    persistState = cacheModes.stateMode == "persist",
						    stateIds = Object.keys(currentState);
						// when do we save the state for a context?
						// a. we are told to persist it
						// b. we have a stateId other than default on it - so we persist only the state ids
						if(persistState) {
							statesToPersist[ctxId] = statesToPersist[ctxId] || {};
							statesToPersist[ctxId]["default"] = sm.states[ctxId]["default"];
						}
						stateIds.forEach(function(stateId) {
							if(stateId !== "default") {
								statesToPersist[ctxId] = statesToPersist[ctxId] || {};
								if(statesPerPage[ctxId].indexOf(stateId) > -1) {
									statesToPersist[ctxId][stateId] = sm.states[ctxId][stateId];
								} else {
									// since saving to the file system does deep extend, it's not enough to not pass the
									// states we don't want to persist. we need to mark them as null so that they
									// will be overridden in the file system, and later cleaned up in the background.
									// Yes, I don't like this as well... :-(
									statesToPersist[ctxId][stateId] = null;
								}
							}
						});
					});

					//if running in the dashboard preview, don't cahce the blueprint pages (it causes problems in the dual preview windows: mobile + tablet)
					!Utils.isInDashboard() && sm.saveStructureStateToCache({states: statesToPersist});
				}
			}
		};

		Capriza.Model.Structure = {

			extractStructure:function(ctxId){
				var page = Capriza.Model.ContextPage.getByContextId(ctxId);
				if(!page) {
					Logger.error("Failed to extract state, page not found.", undefined, "State", "ctxId:" + ctxId );
					return;
				}


				function processControlsDFS(controls){
					if(!controls) return;

					return _.map(controls,function(ctrl){
						var obj = {};
						if (!(ctrl instanceof Backbone.Model)) { // TODO <- do this better
							ctrl = Capriza.Model.Control.getById(ctrl);
						}

						_defaultControlStructureProps.forEach(function(prop){
							if(ctrl.get(prop)) {
								obj[prop] = ctrl.get(prop)
							}

						});

						if(ctrl.get("controls") && ctrl.get("controls").length > 0) {
							obj["controls"] = processControlsDFS(ctrl.get("controls"));
						}

						return obj;
					});
				}

				var pageControls = page.get("controls");

				var retStructure = {
					id: page.get("id"),
					contextId: page.get("contextId"),
					controls:processControlsDFS(pageControls)
				};


				return retStructure;
			}

		};

		//An object for cache abstraction - write and reads from the device's file system when available, with localStorage fallback.
		//run init(), before use.
		var BlueprintCache = Capriza.BlueprintCache = {
			blueprintData: {}, //holds the blueprint structure read from the file system set the params.readBlueprintData = true.
			fileSystemAvailable: null,
			inWritingProcess: false, //when reading/writing we may have to wait for the current writing process to end.
			writeAgainWhenFinished: false, //when calling saveChanges() while writing, we will call it again after current write finishes

			init: function(callback){
				BlueprintCache.fileSystemAvailable = BlueprintCache.fileSystemAvailable || (Utils.getFiler && !!Utils.getFiler());
				Logger.debug("[Blueprint Cache] file system available? : " + BlueprintCache.fileSystemAvailable);
				var readTimeout;

				if (BlueprintCache.fileSystemAvailable){
					var readFromFileTimeout = true;
					if (BlueprintCache.inWritingProcess){
						Logger.debug("[Blueprint Cache] init() called during writing to the file, abort reading from file and return current known data");
						readTimeout && clearTimeout(readTimeout);
						callback(BlueprintCache.blueprintData);
					}
					else {
						Utils.getBlueprintFromFile(null, function (blueprintData) {
							if (!BlueprintCache.inWritingProcess){
								BlueprintCache.blueprintData = blueprintData || {};
								Logger.debug("[Blueprint Cache] got blueprint from fileSystem with keys: " + Object.keys(BlueprintCache.blueprintData));
							}
							else{
								Logger.debug("[Blueprint Cache] finished reading while data is being written, ignoring read data: " + Object.keys(BlueprintCache.blueprintData));
							}

							readTimeout && clearTimeout(readTimeout);
							callback(BlueprintCache.blueprintData);
						});
					}

					readTimeout = setTimeout(function(){
						Logger.debug("[Blueprint Cache] Couldn't read blueprint data from file in 5 seconds");
					}, 5000);
				}
				else{
					callback(BlueprintCache);
				}
			},

			getItem: function(key){
				if (BlueprintCache.fileSystemAvailable){
					return BlueprintCache.blueprintData[key];
				}
				else {  //falling back to localStorage
					return ClientCache.getItem(key);
				}
			},

			//should not be widely used.. please use getItem abstraction
			getItemFromLocalStorage: function(key){
				return ClientCache.getItem(key);
			},

			setItem: function (key, value, both){
				if (BlueprintCache.fileSystemAvailable){
					BlueprintCache.blueprintData[key] = value;
				}

				//both: means to in every case save the data to the clientCache.
				//we need it because unfortunately we have to save the modelId also in the localStorage because
				//we need to use these in run.js before we can use the loginMessageWriter to load it from the file due
				//to mboot dependency in underscore and backbone when defining the Dispatcher in which is used in
				//LoginMessageWriter
				if (both || !BlueprintCache.fileSystemAvailable) {
					ClientCache.setItem(key, value);
				}
			},

			removeItem: function(key){
				if (BlueprintCache.fileSystemAvailable){
					delete BlueprintCache.blueprintData[key];
				}
				else{
					ClientCache.removeItem(key);
				}
			},

			saveChanges: function(successCallback, errorCallback){
				if (BlueprintCache.fileSystemAvailable){
					Logger.debug("[Blueprint Cache] Going to save blueprint in file, keys: " + Object.keys(BlueprintCache.blueprintData));
					if (BlueprintCache.inWritingProcess){
						Logger.debug("[Blueprint Cache] saveChanges called during writing process, setting writeAgainWhenFinished=true and aborting.");
						BlueprintCache.writeAgainWhenFinished = true;
						return;
					}
					BlueprintCache.inWritingProcess = true;
					Utils.saveBlueprintInFile(BlueprintCache.blueprintData, function(){
						//success
						Logger.debug("[Blueprint Cache] writing to file success! writeAgainWhenFinished: " + BlueprintCache.writeAgainWhenFinished);
						if (BlueprintCache.writeAgainWhenFinished){
							BlueprintCache.writeAgainWhenFinished = false;
							BlueprintCache.inWritingProcess = false;
							BlueprintCache.saveChanges();
						}
						else {
							BlueprintCache.inWritingProcess = false;
							successCallback && successCallback();
						}
					}, errorCallback);
				}
				else if (successCallback){
					successCallback()
				}
			},

			keys: function(){
				if (BlueprintCache.fileSystemAvailable){
					return Object.keys(BlueprintCache.blueprintData);
				}
				else {
					return ClientCache.keys();
				}
			},

			clear: function(){
				if (BlueprintCache.fileSystemAvailable){
					BlueprintCache.blueprintData = {};
				}

				//always clear the localStorage
				ClientCache.keys().filter(function (key) {
					return key.indexOf(structKeyPref) == 0 || key.indexOf(stateKeyPref) == 0;
				}).forEach(function (key) {
					ClientCache.removeItem(key);
				});
				ClientCache.removeItem(modelToken);

			}
		};

		var sm = Capriza.StateManager = {
			structs:{},
			states:{},
			statesUpdated: {}, //saves the states (and state ids) that were updated in this run (session) - to support cacheOnlyBeforeInteraction flag.
			disabledControls: [],
			defaultStructure: null,

			disableWhiteListType: ['clientbutton', 'clientlink', 'panel', 'bubble', 'content', 'tabController', 'tab', 'main', 'topLevel'],

			initBlueprintCache: function(callback){
				callback && BlueprintCache.init(callback);
			},

			setModelId: function(modelId) {

				//after showing uniMessage "zapp is downloading", wait for the next loadState/getIdentity.. engine message, and clear the message.
				Dispatcher.once("blueprint/removeNewVersionMessage", function(){
					Logger.debug("[Blueprint] removing 'downloading new version' message.");
					Utils.hideUnimessages();
					//clear blueprint timeout
					Dispatcher.trigger("blueprint/newContentReady");
				});

				var msg = {type: "progress",
					messageText: getText("newVersion"),
					detailText: getText("zappReloadAuto")};
				this.mvpLoadingMessageTimeout = setTimeout(function(){
					Utils.shouldShowLoadingOnMVP(true);
				}, 3000);

				Utils.showUnimessage(msg, true, true);

				function setModelIdAfterInitCache(){
					BlueprintCache.setItem(modelToken, modelId, true);
					BlueprintCache.saveChanges();
				}

				// invalidate all structs and states - call cleanBlueprint which will also init the blueprint cache.
				sm.cleanBlueprint({performInit: true, andSave: false}, setModelIdAfterInitCache); //the save will happen after.
			},

			cacheStyleSets: function(ctrl) {
				var ssIds = ctrl.styleSetIds,
				    mcKey = (ctrl.mcTemplId || ctrl.id) + (ctrl.isBox ? "box" : "");
				if (ssIds) Capriza.Model.StyleSetDB[mcKey] = ssIds;

				ctrl.controls && ctrl.controls.forEach(function(control) {
					sm.cacheStyleSets(control);
				});
			},

			addStructure: function(structure) {
				(structure || []).forEach(function(struct) {
					// extend id from unique id that is the same, just as string:
					var structIdNum = Number(struct.uniqueId);
					if(struct.id === undefined && !isNaN(structIdNum)) {
						struct.id = structIdNum;
					}
					// in case we are going to override the controls property, cache styleSets for the controls in
					// the struct.
					// i.e. in a table, the style sets are passed on the two dummy controls in the struct and
					// not in the state for each control
					sm.cacheStyleSets(struct);

					// check if we should persist the structure or not
					// cacheMode : persist/persist - save struct and state to fs/ls
					//           : persist/session - save struct to fs/ls, save state in memory
					//           : none/none - you don't really need this comment to figgure our what it means... :-)
					var cacheModes = Utils.getCacheModes(struct.cacheMode);
					if(/^(persist|session)$/.test(cacheModes.structMode)) {
						sm.structs[struct.ctxId] = struct;
					}
				});
			},

			updateStructure: function(structMsg) {
				var ctxId = structMsg.ctxId,
				    structKey = structKeyPref + ctxId,
				    currentStruct = sm.structs[ctxId];

				if(!currentStruct) return;
				var stateCacheMode = Utils.getCacheModes(currentStruct.cacheMode).stateMode;
				// construct the new struct from the old one, while iterating update it accordingly
				function removeFromStruct(allControls, controlsToRemove) {
					if(!(allControls && allControls.length > 0) || !(controlsToRemove && controlsToRemove.length > 0)) return;

					var allCnt = allControls.length;

					while(allCnt--) {
						var current = allControls[allCnt];
						var removeCnt = controlsToRemove.length;
						while(removeCnt--) {
							if(current.id === controlsToRemove[removeCnt]) {
								allControls.splice(allCnt, 1);
								controlsToRemove.splice(removeCnt,1);
								if(stateCacheMode === "persist" || stateCacheMode === "session") {
									if(sm.states && sm.states[ctxId] &&
										sm.states[ctxId]["default"] && sm.states[ctxId]["default"].controls)
										delete sm.states[ctxId]["default"].controls[current.id];
								}

								break; // break from iteration over removed array
							}
						}
						if(current.controls && current.controls.length > 0 ) removeFromStruct(current.controls, controlsToRemove);
						if(controlsToRemove.length === 0) {
							break; // break from iteration over all controls
						}
					}
				}


				function findControlInStruct(controls, controlId) {
					for(var i=0; i< controls.length; i++){
						if(controls[i].id === controlId) {
							return controls[i];
						}
						if(controls[i].controls && controls[i].controls.length > 0) {
							var innerControl = findControlInStruct(controls[i].controls, controlId);
							if(innerControl) return innerControl;
						}
						if(controls[i].groupHeader){
							if(controls[i].groupHeader.id === controlId) {
								return controls[i].groupHeader;
							}
							if (controls && controls[i].groupHeader.controls && controls[i].groupHeader.controls.length > 0) {
								var headerControl = findControlInStruct(controls[i].groupHeader.controls, controlId);
								if (headerControl) return headerControl;
							}
						}
					}
					return null;
				}

				function replaceControlInStruct(controls, newControl) {
					if(!controls || controls.length === 0) return;
					for(var i=0; i< controls.length; i++){
						if(controls[i].id === newControl.struct.id) {
							controls[i] = newControl.struct;
							if(stateCacheMode === "persist" || stateCacheMode === "session") {
								sm.states[ctxId] = sm.states[ctxId] || {};
								sm.states[ctxId]["default"] = sm.states[ctxId]["default"] || {};
								sm.states[ctxId]["default"].controls = sm.states[ctxId]["default"].controls || {};
								sm.states[ctxId]["default"].controls[newControl.struct.id] = newControl.state;
							}
							return true;
						}
						if(controls[i].controls && controls[i].controls.length > 0) {
							var innerControl = replaceControlInStruct(controls[i].controls, newControl);
							if(innerControl) return true;
						}
					}
					return false;
				}

				if(structMsg.removed && structMsg.removed.length) {
					var removedClone = _.clone(structMsg.removed);
					removeFromStruct(currentStruct && currentStruct.controls, removedClone);
				}

				// handle added
				if(structMsg.added) {
					var added = Object.keys(structMsg.added).map(function(mcIdKey) {
						var addedObj = structMsg.added[mcIdKey];
						return { id: mcIdKey, index: addedObj.index, parent: addedObj.parent, struct: addedObj.struct, state: addedObj.state};
					});

					added.forEach(function(addedObj) {
						var parentControl = findControlInStruct(currentStruct.controls, addedObj.parent);
						parentControl.controls = parentControl.controls || [];
						parentControl.controls.splice(addedObj.index, 0, addedObj.struct);
						if(stateCacheMode === "persist" || stateCacheMode === "session") {
							sm.states[ctxId] = sm.states[ctxId] || {};
							sm.states[ctxId]["default"] = sm.states[ctxId]["default"] || {};
							sm.states[ctxId]["default"].controls = sm.states[ctxId]["default"].controls || {};
							sm.states[ctxId]["default"].controls[addedObj.struct.id] = addedObj.state;
						}
					});
				}

				// handle modified
				if(structMsg.modified) {
					Object.keys(structMsg.modified).forEach(function(controlId) {
						replaceControlInStruct(currentStruct.controls, structMsg.modified[controlId]);
					});
				}

				//ClientCache.setItem(structKey, JSON.stringify(currentStruct));
				sm.structs[structMsg.ctxId] = currentStruct;
				//sm.saveStructureStateToCache();
			},

			mergeStructureState:function(params){
				if(!params) return;

				var state = params.state,
				    ctxId = params.ctxId || state.ctxId || state.contextId,
				    structure = params.structure ? params.structure : (sm.structs[ctxId] || {}),
				    unsynced = params.unsynced;

				// create clone so that we don't override the initial data!!!
				structure = JSON.parse(JSON.stringify(structure));
				state = JSON.parse(JSON.stringify(state));

				var isRecordMode = (window.isDesignerPreview || window.designerLoaded) && $("html").attr("designer-state") === "simplify";

				function processControlsDFS(controls, isDisabled){
					if(!controls) return;

					// TODO: move filter out hidden controls if not in record mode in designer to the engine.
					// This is a temp solution, if this is still in the code 1 year from now, go blame Dror!
					if(!isRecordMode) {
						controls = _.filter(controls, function(ctrl) {
							return (ctrl && ctrl.hidden) ? undefined : ctrl;
						});
					}
					if(!controls || controls.length == 0) return;
					// end of ugly code that compensates for Dror's laziness

					return _.map(controls,function(ctrl){
						var result = _.clone(ctrl);
						if(state.controls[ctrl.id]){
							delete result.missing;
							if(state.controls[ctrl.id].phase && !state.controls[ctrl.id].controls){
								state.controls[ctrl.id].controls = [];
							}
							_.extend(result, state.controls[ctrl.id]);
						}
						if(isRecordMode && result.missing) {
							delete result.missing;
							result.isPhantom = true;
						} else if(result.missing && ctrl.alt) {
							var controls = result.controls;
							result = $.extend(true, {}, ctrl.alt, {alt: ctrl.alt, altDisplayed: true});
							if(!result.controls && controls) result.controls = controls;
						}
						if(isDisabled){
							if(!result.detachMode) {
								if(sm.disableWhiteListType.indexOf(result.type) < 0) {
									result.isDisabled = true;
									sm.disabledControls.push(result.id);
								}
								if(result.click) {
									result.click.isDisabled = true;
									//sm.disabledControls.push(result.click.id);
								}
							}
						}
						if(result.controls && result.controls.length > 0) {
							result["controls"] = processControlsDFS(result.controls, isDisabled);
						}
						if (result.groupHeader) {
							result.groupHeader = processControlsDFS([result.groupHeader], isDisabled)[0];
						}
						if (result.click){
							result.click = processControlsDFS([result.click], isDisabled)[0];
						}
						return result;
					});
				}

				sm.disabledControlsState = [];
				structure.controls = processControlsDFS(structure.controls, unsynced);
				_.extend(structure, state.pageProps);

				return structure;
			},

			mergeStates: function(oldState, newState){
				oldState = oldState || {};
				newState = newState || {};

				//remove missing for controls that were missing, and a new state was received for these (that is not missing).
				if (newState.controls) {
					oldState.controls = oldState.controls || {};
					_.forEach(newState.controls, function (control, id) {
						oldState.controls[id] = oldState.controls[id] || {};
						_.extend(oldState.controls[id], control);
						if (oldState.controls[id].missing && !control.missing) oldState.controls[id].missing = undefined;
						if (oldState.controls[id].phase && !control.phase) oldState.controls[id].phase = undefined;
					});
				}

				if (newState.pageProps){
					oldState.pageProps = _.extend({}, oldState.pageProps, newState.pageProps);
				}

				return oldState;
			},

			loadStructureStateFromCache: function(callback) {

				//sm.loadStructuresFromResource();    --> moved to viewportInit.js before loading blueprint
				sm.loadDefaultStructure(function(){
					sm.loadStatesFromCache(function(){
						Dispatcher.trigger("blueprint/loaded");
						callback && callback();
						debug.blueprintInitialCache = JSON.parse(JSON.stringify(sm));
					});
				});
			},

			/**
			 * Not in use for the moment (structures are loaded from resource (Structure.js) and are cached using the appCache
			 */
			loadStructuresFromCache: function(callback){

				sm.initBlueprintCache(function(){
					var allKeys = BlueprintCache.keys(),
					    structKeys = allKeys.filter(function (key) {
						    return key.indexOf(structKeyPref) == 0;
					    });

					structKeys.forEach(function (key) {
						var suffix = key.replace(structKeyPref, '');
						switch (suffix) {
							case "default" :
								sm.defaultStructure = BlueprintCache.getItem(key).replace(structKeyPref, '');
								break;
							default:
								var struct = BlueprintCache.getItem(key);
								sm.structs[suffix] = typeof struct == "string" ? JSON.parse(struct) : struct;
						}
					});

					Logger.debug("[Blueprint] Structures loaded from cache: " + Object.keys(sm.structs));
					callback && callback();
				});
			},

			loadStatesFromCache: function(callback){
				sm.initBlueprintCache(function() {
					var allKeys = BlueprintCache.keys(),
					    stateKeys = allKeys.filter(function (key) {
						    return key.indexOf(stateKeyPref) == 0;
					    });

					stateKeys.forEach(function (key) {
						var suffix = key.replace(stateKeyPref, ''),
						    state = BlueprintCache.getItem(key);
						sm.states[suffix] = typeof state == "string" ? JSON.parse(state) : state;
						statesPerPage[suffix] = Object.keys(sm.states[suffix] || []);
						// remove default from statesPerPage
						var defaultIndex = statesPerPage[suffix].indexOf("default");
						if (defaultIndex > -1) statesPerPage[suffix].splice(defaultIndex, 1);
					});

					Logger.debug("[Blueprint] States loaded from cache: " + Object.keys(sm.states));

					callback && callback();
				});
			},

			/**
			 * loads the structures from the resource file (structure.js) into sm.structs in sync mode.
			 * assuming structures.js (Capriza.structManager) has already been loaded.
			 */
			loadStructuresFromResource: function(){
				Logger.info("Trying to load structures from resource. StructManager exits? " + !!Capriza.structManager);
				if (Capriza.structManager && Capriza.structManager.getContextIds && Capriza.structManager.getStruct) {
					Capriza.structManager.getContextIds().forEach(function(ctxId) {
						sm.structs[ctxId] = Capriza.structManager.getStruct(ctxId, Capriza.device.isTablet);
					});
					Logger.debug("[Blueprint] Initialized structs from resource: " + Object.keys(sm.structs));
				}
			},

			/**
			 * Loads the default structure (MVP) from the cache and saves it in sm.defaultStructure
			 */
			loadDefaultStructure: function(callback){
				sm.initBlueprintCache(function(){
					sm.defaultStructure = BlueprintCache.getItem(defaultStructKey);
					sm.defaultStructure = sm.defaultStructure ? sm.defaultStructure.replace(structKeyPref, '') : sm.defaultStructure;
					Logger.debug("[Blueprint] Default structure (MVP) id is loaded: " + sm.defaultStructure);
					callback && callback();
				});
			},

			saveStructureStateToCache: function(params) {

				function saveStructureStateToCache() {
					var structs = params.structs, states = params.states;
					if (structs) {
						Object.keys(structs).forEach(function (key) {
							switch (key) {
								case "default" :
									BlueprintCache.setItem(defaultStructKey, structKeyPref + sm.defaultStructure, true);
									break;
								default:
								{
									var structStr = typeof structs[key] == "string" ? structs[key] : JSON.stringify(structs[key]);
									BlueprintCache.setItem(structKeyPref + structs[key].ctxId, structStr);
								}
							}
						});
					}

					if (states) {
						Object.keys(states).forEach(function (ctxId) {
							if (states[ctxId]) {
								Object.keys(states[ctxId]).forEach(function (stateId) {
									if (states[ctxId][stateId] === null)
										delete states[ctxId][stateId];
								});
							}
							var state = typeof states[ctxId] == "string" ? states[ctxId] : JSON.stringify(states[ctxId]);
							BlueprintCache.setItem(stateKeyPref + ctxId, state);
						});
					}

					BlueprintCache.saveChanges();
				}

				//if running in the dashboard preview, don't cahce the blueprint pages (it causes problems in the dual preview windows: mobile + tablet)
				sm.allowSaveBlueprint() && sm.initBlueprintCache(saveStructureStateToCache);
			},

			allowSaveBlueprint: function() {
				return !Utils.isInDashboard();
			},

			saveDefaultStructureToCache: function(){
				BlueprintCache.setItem(defaultStructKey, structKeyPref + sm.defaultStructure, true);
				BlueprintCache.saveChanges();
			},

			removeDefaultStructureFromCache: function(){
				BlueprintCache.removeItem(defaultStructKey);
				BlueprintCache.saveChanges();
			},

			loadBlueprint: function(params) {
				Logger.debug('[loadBlueprint] load started');

				Capriza.StateManager.loadStructureStateFromCache(function(){sm.blueprintLoaded(params)});
			},

			blueprintLoaded: function (params){
				Logger.info("[loadBlueprint] blueprint loaded");

				if(sm.structs) {
					Object.keys(sm.structs).forEach(function(key) {
						if(key !== "default") {
							Logger.debug("[loadBlueprint] caching stylesets for ctx " + key);
							sm.cacheStyleSets(sm.structs[key]);
						}
					});
				}

				var ctxId = (params && params.ctxId) || (sm.defaultStructure),
				    stateId = (params && params.stateId) || "default";
				if(!ctxId) {
					Logger.debug('[loadBlueprint] No context found');
				} else {
					Logger.debug('[loadBlueprint] extracting structure and state for context: ' + ctxId);
					var state = (params && params.state) || (sm.states && sm.states[ctxId] && sm.states[ctxId][stateId]),
					    structure = sm.structs && sm.structs[ctxId];

					if(!state) Logger.debug("[loadBlueprint] no state found for ctx = " + ctxId + " and stateId = " + stateId);
					if(!structure) Logger.debug("[loadBlueprint] no structure found for ctx " + ctxId);
					var pageState = structure && state && Capriza.StateManager.mergeStructureState({state: state, structure: structure, unsynced: true});
				}

				if(pageState) {
					sm.isCachedBlueprintShown = true;
					Logger.debug('[loadBlueprint] zapp has blueprint, starting to show it. setting isCachedBlueprintShown=true');
					sm.showBlueprint(pageState);
					Dispatcher.trigger("mobile/blueprint/loaded");
				} else {
					Logger.debug('[loadBlueprint] zapp has no blueprint. setting isCachedBlueprintShown=false');
					Dispatcher.trigger("mobile/blueprint/noBlueprint");
					sm.isCachedBlueprintShown = false;
				}
			},

			/**
			 * Updates the isDisabled of all the controls that were updated in the current loadState.
			 * if these were formaly disabled (mvp), and are not disabled in the update, will not be disabled anymore
			 */
			restoreDisabled: function(state) {
				if (!state.controls || sm.disabledControls.length === 0) return;

				sm.disabledControls = sm.disabledControls.filter(function(ctrId){
					var ctrl = findControlInState(state.controls, ctrId);
					if (ctrl) {
						ctrl.isDisabled = "isDisabled" in ctrl ? ctrl.isDisabled : false;
						return false; //take this control out of the disabledControls
					}
					return true;
				});
			},

			cleanBlueprintFromMemory: function () {
				//synced code:
				sm.states = {};
				sm.structs = {};
				sm.defaultStructure = undefined;
				sm.newDefaultStructure = undefined;
				sm.isCachedBlueprintShown = false;
				sm.statesUpdated = {};
			},

			cleanBlueprint: function(params, successCallback, errorCallback) {

				sm.cleanBlueprintFromMemory();

				//unsynced code:
				params = _.extend({performInit: true, andSave: true, hideUnimessage: true}, params);
				function cleanBlueprintAfterInitCache() {
					Logger.debug("[Blueprint] clean blueprint is called");

					BlueprintCache.clear();
					params && params.hideUnimessage && Utils.hideUnimessages();
					if (params && params.andSave) BlueprintCache.saveChanges(successCallback, errorCallback);
					else if (successCallback) successCallback();
				}

				if (params.performInit)
					sm.initBlueprintCache(cleanBlueprintAfterInitCache);
				else
					cleanBlueprintAfterInitCache();
			},

			showBlueprint: function(pageState) {
				$.capriza.activePage = $([]);

				Logger.debug('[loadBlueprint] handling started. appCache status: ' + applicationCache.status + ' Capriza.firstRun: ' + Capriza.firstRun);
				take('loadingBlueprint');

				Capriza.EngineApi.Handlers.newStateWithStructure(pageState, {blueprint: true});

				Logger.debug("[loadBlueprint] handling blueprint ended");
				Logger.tag("BlueprintShown");
			},

			//search recursively in the context structure for the controlId's structure and return it.
			getStructureForControl: function (ctxId, controlId){
				var ctxStructure = sm.structs[ctxId];

				function getStructureRecursive(root){
					if (!root) return;
					if (root.id == controlId) return root;

					//else, keep searching in it's controls..
					var controlFound;
					if (root.controls && Array.isArray(root.controls)){
						root.controls.forEach(function (control){
							controlFound = controlFound || getStructureRecursive(control);
							if (controlFound) return controlFound;
						});
					}

					return controlFound;
				}

				if (!ctxStructure || !ctxStructure.controls || !Array.isArray(ctxStructure.controls)) return;

				return getStructureRecursive(ctxStructure);
			},

			/**
			 * @returns a flat array of control ids from the structure of the given context top-down, dfs
			 */
			getStructureControlsSorted: function(contextId){
				var controlsSorted = [];

				function getControlsRecursive(control){
					if (!control) return;
					control.id && controlsSorted.push(control.id);
					control.controls && control.controls.forEach(getControlsRecursive);
				}

				if (sm.structs && sm.structs[contextId]) getControlsRecursive(sm.structs[contextId]);
				return controlsSorted;
			},

			checkIfShouldBeMVP: function(ctxId){
				//if we havn't set a "newDefault" in this session, we look for it (ctxId is a candidate).
				//if we have the structure for ctxId and it is not login
				if (sm.readyForCaching && !sm.newDefaultStructure && sm.structs[ctxId] && !sm.structs[ctxId].login && sm.allowSaveBlueprint()) {
					//if it is persistant (cached), it's the new MVP
					if (Utils.getCacheModes(sm.structs[ctxId].cacheMode).structMode == "persist") {
						Logger.debug("[Blueprint] saving structure '" + ctxId + "' as default (MVP)");
						sm.newDefaultStructure = ctxId;
						sm.defaultStructure = ctxId;
						sm.saveDefaultStructureToCache()
					}
					else { //otherwise there is no MVP in this session.
						sm.newDefaultStructure = 'none'; //this is for next time we need check for potential MVP.
						sm.defaultStructure = undefined;
						sm.removeDefaultStructureFromCache();
					}
				}
			}

		};

		Dispatcher.on("mobile/error identity/host/logout", sm.cleanBlueprint);

		Dispatcher.on("asset/loaded/structure", function(){
			Logger.debug("[Blueprint] updating new structures in Capriza.StateManager");
			$.capriza.activePage = $([]);
			sm.loadStructuresFromResource();
		});

		Dispatcher.on("login/auto/failed", function(){
			sm.isCachedBlueprintShown = false;
		})

		/**
		 * Searches in controls map, and if doesn't find it there looks in every entry for nested controls.
		 *
		 * @param controls : a map of id ==> control data, e.g. { "mc123" : { ... }, "mc456" : { ... } }
		 * @param ctrId : the id of the control to find
		 * @returns the data of the control
		 */
		function findControlInState(controls, ctrId) {
			if (controls[ctrId]) {
				return controls[ctrId];
			} else {
				for (var id in controls) if (controls.hasOwnProperty(id)) {
					var res = getDescendant(controls[id], ctrId);
					if (res) return res;
				}
			}
		}

		/**
		 *
		 * @param control : e.g. { id: "kuku", controls: [ ... ] }
		 * @param id : the id of the control to find
		 * @returns the data of the control
		 */
		function getDescendant(control, id) {
			var controls = control.controls;
			if (controls) {
				for (var i= 0,ii=controls.length;i<ii;i++) {
					var child = controls[i];

					if (child.id === id) return child;

					var res = getDescendant(child, id);
					if (res) return res;
				}
			}
		}

		function showErrorAndReload(){

			var messageText = getText("somethingIsWrong"),
			    detailText = getText("couldNotUpdatePage"),
			    actionText = getText("retry");

			function reload(){
				//Utils.updateUnimessage({type: "progress", messageText: getText("restarting"), actionText: null, detailText: null});
				setTimeout(Utils.reload, 4000); //if nothing happens within 4 seconds, reload.
				sm.cleanBlueprint({performInit: false, andSave: true, hideUnimessage: false}, Utils.reload, Utils.reload);
			}
			Utils.showUnimessage({type: "error", messageText: messageText,
				detailText: detailText, actionText: actionText,
				action: reload}, false, true);
		}

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/LoadingMessage.js

try{
	;
	(function () {

		//function blockDocument(e) {
		//    logger.log("block document: " + e.type + ": " + e.target.tagName + (e.target.id || ""));
		//
		//    // block everything but these interactable items
		//    var interactableItems = '#side-burger, #side-menu, #header-overlay, #viewport-overlay, #feedback-page';
		//
		//    if ($(e.target).closest($(interactableItems)).length != 0 || e.target.className.indexOf('loading-message') >= 0) {
		//        return;
		//    }
		//
		//    var $loadingMessage = $('.loading-message');
		//    $loadingMessage.loadingMessage('option', 'topHeader', Capriza.translator.getText(Capriza.translator.ids.oneMoment));
		//    $loadingMessage.loadingMessage('update');
		//    if (/^(INPUT|SELECT|BUTTON|TEXTAREA)$/.test(e.target.tagName.toUpperCase())) {
		//        $loadingMessage.loadingMessage('show');
		//    }
		//
		//    // for touch devices - preventing default means disabling scroll. So we do it only on the form elements
		//    if (e.type !== "touchstart" || /^(INPUT|SELECT|BUTTON|TEXTAREA)$/.test(e.target.tagName.toUpperCase())) {
		//        e.preventDefault();
		//        e.stopPropagation();
		//    }
		//}
		//
		//function blockUI() {
		//    Logger.debug('blocking the UI');
		//    var element = Capriza.fullScreen ? document : $(".viewport")[0];
		//    if (Utils.isCachedMVPShown()) {
		//        Logger.debug('not blocking the UI because of cached mvp is rendered');
		//        return;
		//    }
		//    element.addEventListener("click", blockDocument, true);
		//    element.addEventListener("mousedown", blockDocument, true);
		//    element.addEventListener("touchstart", blockDocument, true);
		//    element.addEventListener("touchmove", blockDocument, true);
		//
		//    $('.loading-message').addClass('blocking');
		//}
		//
		//function unblockUI() {
		//    var element = Capriza.fullScreen ? document : $(".viewport")[0];
		//    element.removeEventListener("click", blockDocument, true);
		//    element.removeEventListener("mousedown", blockDocument, true);
		//    element.removeEventListener("touchstart", blockDocument, true);
		//    element.removeEventListener("touchmove", blockDocument, true);
		//
		//    var $loadingMessage = $('.loading-message');
		//    $loadingMessage.loadingMessage('option', 'topHeader', '');
		//    $loadingMessage.removeClass('blocking');
		//}

		Dispatcher.on("app/initMessages", function () {
//    setTimeout(function () {
			if (!$('.viewport .loading-message')[0]) {
				Capriza.LoadingManager = {};
				$('.viewport').append($('<div></div>').loadingMessage().css('visibility', 'hidden'));
				$('.loading-message').loadingMessage('hide', function () {
					$('.loading-message').css('visibility', 'visible');
				});
			}
		});
//    }, 500);

		Dispatcher.on('message/show', function (options) {

			// Format the passed in options to work with the loading message
			var text = options.buttonText;
			var callback = options.buttonAction;
			var actions = [
				{text: text, callback: callback}
			];

			// Determine whether we should show the loading indicator
			var shouldShowLoadingIndicator = true;
			if (text) {
				shouldShowLoadingIndicator = false;
			}

			// Update the options object
			options['actions'] = actions;
			options['shouldShowLoadingIndicator'] = shouldShowLoadingIndicator;

			// Refresh the loading message
			$('.loading-message').loadingMessage('update', options);
//        $('.loading-message').loadingMessage('show');
		});


		Dispatcher.on('message/slowNetworkMsg', function (options) {

			if (window.location.hash.indexOf('devmode') > -1 || window.testMode) return;
			if (window.isDesignerPreview) return;
			Logger.tag("slowConnection");

			Dispatcher.trigger('message/showCustom', {message: Capriza.translator.getText(Capriza.translator.ids.slowConnection), shouldShowLoadingIndicator:false})
		});

		Dispatcher.on('message/showCustom', function (options) {

			// Refresh the loading message
			$('.loading-message').loadingMessage('update', options);
		});

		Dispatcher.on("loading/stopBlocking", function () {
			Utils.unblockUI();

			if(this.enableRocketman) {
				clearTimeout(this.rocketmanTimer);
				delete this.rocketmanTimer;
				if (this.rocketmanActive) {
					RocketmanSplash.hideSplash();
					delete this.rocketmanActive;
				}
			}
		});


		Dispatcher.on("loading/stop", function () {
			this.loading = false;
			$('.loading-message').loadingMessage('hide');
			Utils.unblockUI();

			if(this.enableRocketman) {
				clearTimeout(this.rocketmanTimer);
				delete this.rocketmanTimer;
				if (this.rocketmanActive) {
					RocketmanSplash.hideSplash();
					delete this.rocketmanActive;
				}
			}
		});

		Dispatcher.on("loading/start", function (options) {
			if (!Utils.shouldShowLoadingOnMVP() && (Utils.isCachedMVPShown() || Utils.isUnimessageShown() || $('#context-not-found').length > 0)) return;
			this.loading = true;
			options = options || {};

			if (!options.nonBlocking) {
				Utils.blockUI(options);
			}

			// if were on splash dont display loading message

			if (Capriza.designerMode && Capriza.designerMode === "simplify") return;
			if(!Capriza.splashing) {

				var $loadingMessage = $('.loading-message');
				$loadingMessage.loadingMessage('update', _.extend(options, {
					topHeader: "",
					iconOnly: !((options && options.message) || Utils.isCachedBlueprintShown()),
					actions: []
				}));
				Utils.removeViewportOverlayForElement("irrecoverable-message");
				$loadingMessage.removeClass('irrecoverable-message');
				$('.loading-message-buttons', $loadingMessage).remove();
			}
		});

		Dispatcher.on("loading/showOnMVP", function(options){

		});

		Dispatcher.on('dialog/show', function (options) {

			// Parse the options to format for the loading message widget
			var topHeader = '',
			    message = '',
			    actions = [],
			    shouldShowLoadingIndicator = false;
			if (options.msg) {

				if (options.msg.indexOf('terminated') > -1) {
					message = Capriza.translator.getText(Capriza.translator.ids.disconnectedDueTo);
				} else if (options.msg.indexOf('inactive') > -1) {
					//message = 'Sorry, your connection has either been lost or is temporarily unavailable. Please try again later or use the desktop version, if applicable.';
					topHeader = Capriza.translator.getText(Capriza.translator.ids.sorryLostConnection);
					message = Capriza.translator.getText(Capriza.translator.ids.tryAgainLater);
				} else if (options.msg.toLowerCase().indexOf('replay') > -1) {
					//message = 'The application failed due to network issues. Try to connect again.';
					message = Capriza.translator.getText(Capriza.translator.ids.networkIssues);
				}else if (options.msg.toLowerCase().indexOf('inactivity') > -1) {
					//message = 'The application failed due to network issues. Try to connect again.';
					message = Capriza.translator.getText(Capriza.translator.ids.disconnectedDueTo);
				} else {
					message = options.msg;
				}
			}

			if (options.vpnAlert) {
				topHeader = 'Connecting to VPN...';
				message = 'One moment please.';
				shouldShowLoadingIndicator = true;
			}
			if (options.ie) {
				topHeader = 'Please Switch Browsers';
				message = 'We currently do not support IE.'
			}

			if (options.refreshButton === undefined) options.refreshButton = true;
			if (options.refreshButton) {
				actions[0] = {
					text: Capriza.translator.getText(Capriza.translator.ids.reconnect),
					callback: function () {
						Utils.reload();
					}
				};
			}

			var $loadingMessage = $('.loading-message');
			$loadingMessage.loadingMessage('clear');
			$loadingMessage.loadingMessage('update', {
				topHeader: topHeader,
				iconOnly: false,
				message: message,
				actions: actions,
				shouldShowLoadingIndicator: shouldShowLoadingIndicator
			});

			if (options.refreshButton) {
				Utils.viewportOverlayForElement("irrecoverable-message");
				$loadingMessage.addClass('irrecoverable-message');
				$loadingMessage.transition({y: 0});
			}
		});

		Dispatcher.on('dialog/hide', function (options) {
			$('.loading-message').loadingMessage('hide');
		});


		function exposeApi(widget) {
			_.extend($.capriza, {

				showLoadingMsg: function (isClient, options) {
					widget.update(isClient, options);
				},

				hideLoadingMsg: function () {
					widget.hide();
				}
			});
		}

		var emptyFunc = function () {
		};
		exposeApi({ show: emptyFunc, hide: emptyFunc });

		$.widget("capriza.loadingMessage", {

			options: {
				topHeader: "", /* Message title */
				message: "", /* Loading bar text */
				iconOnly: false,
				actions: [
//                {text: 'Button 1', callback: function (){}}
				], /* Action performed on button click */
				shouldShowLoadingIndicator: true, /* Whether or not to show the loading spinner */
				duration: 1000                                          /* How long to display the loading indicator */
			},

			// Create the basic loading message container structure
			_create: function () {

				// Complete the loading message template with the options hash
				// and append it to the widget element
				this.element.addClass('loading-message with-animation').addClass('clearfix');
				this._renderTemplate();

				this.displayMessages = [];
				this.displayMessages.push(Capriza.translator.getText(Capriza.translator.ids.almostThere));
				this.displayMessages.push(Capriza.translator.getText(Capriza.translator.ids.fewMoreMoments));
				this.displayMessages.push(Capriza.translator.getText(Capriza.translator.ids.gettingThere));
				this.displayMessages.push(Capriza.translator.getText(Capriza.translator.ids.stillWorking));

				// Set up the widget to respond to Capriza hide and show messages
				exposeApi(this);
			},

			_renderTemplate: function() {
				var _this = this;

				// xperiaZ makes the loading indicator to jitter. ticket #8500
				var xperiaZModels = ["C6603", "C6602"];
				if (Capriza.device.stock && (Capriza.device.xperiaZ || Capriza.device.xperiaS)){
					this.options.shouldShowLoadingIndicator = false;
				}

				// Build the handlebars template
				this.element.html(Handlebars.templates['loadingMessage'](this.options));

				// the loading indicator doesn't render well in linux designer
				if (window.isDesignerPreview && navigator.platform == "Linux x86_64") {$('.loading-indicator', this.element).addClass('designer-linux-loading-indicator')}

				// Add functionality to the buttons
				this.element.find('.loading-message-buttons li').each(function (index, button) {
					var callback = _this.options.actions[index].callback;
					$(button).click(function() {
						callback.apply();
					});
				});

			},

			// Refresh the loading message view when options are changed
			option: function (optionName, value) {

				// Update the options
				this._super(optionName, value);

				// Refresh the view
				this.update(undefined, true);
			},

			// Update the widget with the current options
			update: function (options, skipShow) {
				var _this = this;

				if (options && options.message == "Automating..." && !this.showingIcon && options.maxAutomations != undefined){
					_this.automating = true;
					// on MVP page we don't need to display the "Still working..." message
					var firstMessage = Utils.isCachedMVPShown() ? 2 : 3;
					var numberOfAutomationLeft = !options.maxAutomations ? 0 : (options.maxAutomations > firstMessage ? firstMessage : options.maxAutomations);
					options.message = this.displayMessages[numberOfAutomationLeft];

					if (this.suppressTimeout){
						clearTimeout(this.suppressTimeout);
					}
				}
				if (options && options.iconOnly){
					options.message = Capriza.translator.getText(Capriza.translator.ids.workingOnIt);
				}

				//we use this to show the last message that arrived within the suppress messages timeout
				if (options && options.message){
					this.newMessageAvailable = true;
					Logger.debug("[Loading-Message] General set message text: " + options.message);
				}

				// Update the options
				this._setOptions(options);

				if (this.suppressMessages || (Utils.isCachedBlueprintShown() && !(options && options.message))) return;

				if (options && options.message){
					this.newMessageAvailable = false;
					Logger.debug("[Loading-Message] General will show message text: " + options.message);
				}
				// Refresh the view
				this.element.empty();

				// Hide the indicator while we update its contents
				if (this.element.hasClass('hidden')){
					var prevVisibility = this.element.css('visibility');
					this.element.css('visibility', 'hidden');
					_this._renderTemplate();
					_this.hide(function () {
						if (!skipShow) {
							_this.element.css('visibility', 'visible');
							_this.show('', _this.options);
						} else _this.element.css('visibility', prevVisibility);
					});
				} else {
					_this.suppressMessages = true;
					_this.longStep.call(_this);
					if (_this.suppressTimeout){
						clearTimeout(_this.suppressTimeout);
					}
					_this.suppressTimeout = setTimeout(function(){
						_this.suppressMessages = false;
					}, _.random(3900,4900));
					_this._renderTemplate();
				}

			},

			// for long steps add a message after 5 seconds
			longStep: function(timeout){
				var _this = this;
				timeout = timeout || 9000;
				if (_this.longStepTimeout){
					clearTimeout(_this.longStepTimeout);
				}
				if (_this.automating) {
					_this.longStepTimeout = setTimeout(function () {
						_this.suppressMessages = false;
						if (_this.newMessageAvailable){
							_this.update();
						} else {
							_this.option("message", Capriza.translator.getText(Capriza.translator.ids.takingLonger));
						}
						_this.suppressMessages = false;
					}, timeout);
				}
			},

			runSingleStepMessages: function(){
				function setNextMessage(messageIndex, timeout, nextTimeoutCallback){
					_this.suppressTimeout = setTimeout(function () {
						if (_this.element.hasClass('hidden')){
							clearTimeout(_this.suppressTimeout);
							return;
						}
						var options = {
							message: Capriza.translator.getText(Utils.singleStepMessages[messageIndex]),
							iconOnly: false
						};
						Logger.debug("[Loading-Message] showing single step next message: "+ options.message);
						_this.suppressMessages = false;
						_this.update.call(_this, options);
						_this.longStep.call(_this);
						nextTimeoutCallback && nextTimeoutCallback();
					}, timeout);
				}
				var _this = this;

				setNextMessage(1, 5000, setNextMessage.bind(_this, 2, 4000, setNextMessage.bind(_this, 3, 6000,  function(){setTimeout(function () {
						_this.suppressMessages = false;
					}, _.random(3500, 4500))}
				)));
			},

			// Bring the loading indicator into view
			show: function (isClient, options) {
				// avoid showing two loading indications at once (identity page & generic) but allowing error messages
				if ($("#identity-page.active #splash-message.active").length > 0  && this.options.shouldShowLoadingIndicator) return;

				if (!Utils.shouldShowLoadingOnMVP() && ($('.page.mvp').length > 0 || $(".page.blueprint").length > 0)) return;

				var _this = this;
				$.extend(this.options, options);
				this.element.removeClass('hidden');
				this.suppressMessages = true;
				if (this.options.iconOnly){
					this.element.addClass("um-icon-only");
					this.showingIcon = true;
					if (this.suppressTimeout){
						clearTimeout(this.suppressTimeout);
					}
					this.suppressTimeout = setTimeout(function () {
						_this.showingIcon = false;
						_this.element.removeClass("um-icon-only");
						_this.longStep.call(_this);
						if (_this.options.maxAutomations) {
							_this.suppressTimeout = setTimeout(function () {
								_this.suppressMessages = false;
							}, _.random(3500, 4500));
						} else {
							_this.runSingleStepMessages.call(_this);
						}
					}, 6000);
				} else {
					this.longStep.call(this);
					if (this.suppressTimeout){
						clearTimeout(this.suppressTimeout);
					}
					this.suppressTimeout = setTimeout(function(){
						_this.suppressMessages = false;
					}, _.random(3900,4900));
				}
				if (Utils.shouldShowLoadingOnMVP()){
					this.element.removeClass("with-animation");
					this.element.css("transform", "translate(0px, 0px)");
					this.element.addClass("with-animation");
					Utils.hideUnimessages(true);
				} else {
					Utils.hideUnimessages();
					if (!this.element.hasClass('animating')){
						_this.element.addClass('animating');
						setTimeout(function () {
							_this.element.transition({y: 0}, function () {
								_this.element.removeClass('animating');
							});
						}, 10);
					}
				}

				this._configureTimer(isClient || this.options.isClient);
			},

			// Slide the loading indicator out of view
			hide: function (callback) {
				var _this = this;
				this.isServer = undefined;

				if (this.options.waitForNewPage && this.options.isSingleStep && this.options.singleStepMessageTimeout) {
					Logger.debug("Clearing single step timeout");
					clearTimeout(this.options.singleStepMessageTimeout);
				}

				this.clear();
				if (this.element.hasClass('hidden')) {
					callback && callback.apply(_this, arguments);
					return;
				}

				var offset = this.element.height();

				this.element.transition({y: offset}, function () {
					_this.element.removeClass("um-icon-only");
					_this.element.addClass('hidden');
					Dispatcher.trigger("loadingMessage/hide/end");
					if (callback) {
						callback.apply(_this, arguments);
					}
				});

				Utils.removeViewportOverlayForElement("irrecoverable-message");
			},

			clear: function(){
				this.suppressMessages = false;
				this.automating = false;
				clearTimeout(this.suppressTimeout);
				clearTimeout(this.longStepTimeout);
				clearTimeout(this.timeoutId);
			},

			// Configure the timer that controls how long the loading indicator should display
			_configureTimer: function (isClient) {
				clearTimeout(this.timeoutId);
				if (isClient && !this.isServer) {
					var self = this;
					if (this.options.duration)
						this.timeoutId = setTimeout(function () {
							self.timeoutId = undefined;
							self.hide();
						}, this.options.duration);
				} else if (!isClient) {
					this.isServer = true;
				}
			}
		});

		var RocketmanSplash = Capriza.RocketmanSplash = {
			showSplash: function () {
				var $rocketman = Handlebars.templates.rocketman({msg: Capriza.translator.getText(Capriza.translator.ids.rocketMsg)});
				$('.context-page.active').append($rocketman);

				setTimeout(function () {
					// Fade in message
					$('.background-white .message').addClass('active');
				}, 300);

				// Style the rocketman
				$('.rocketman').velocity({
					translateX: $('.viewport').width() * 1.5 - 50
				}, {
					duration: 300,
					delay: 150,
					complete : function() {
						$('.rocketman').addClass('active');
					}
				});
			},

			hideSplash: function () {
				$('.rocketman').velocity({
					translateX: $('.viewport').width() * 2
				}, {
					duration: 300,
					begin: function () {
						$('.background-white .message').removeClass('active');
					},
					complete: function () {
						$('.rocketman').remove();
						$('.background-white').removeClass('active');
						$('.background-white').remove();
					}
				});
			}
		};

	})();


}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/ToastManager.js

try{
	/**
	 * Created by oriharel on 1/9/15.
	 */

	;(function() {

		Capriza.Toast = {
			show: function(options) {

				var brand = Utils.getBrand();

				if (brand) {
					options = _.extend({primaryColor: brand['primary-color']}, options);
				}
				else {
					options = _.extend({primaryColor: '#888'}, options);
				}

				var $toastEl = $('.toast');
				clearTimeout(Capriza.Toast._hideTOHandler);
				if(options.blockUI){
					Capriza.Toast.block();
				}

				if ($toastEl.length > 0) {
					this.update($toastEl, options);
				}
				else {
					$toastEl = $(Handlebars.templates['toast'](options));

					//$toastEl.css('y', 100);
					$('.viewport').append($toastEl);
					$toastEl.velocity({
						translateY: 80
					}, {
						duration: 50,
						easing: 'out',
						complete: function() {
							$toastEl.removeClass('hidden');
						}
					}).bind(this)
						.velocity({
							translateY: -4
						}, {
							duration: 250,
							easing: 'out'
						}).bind(this)
						.velocity({
							translateY: 0
						}, {
							duration: 250,
							easing: 'ease-in-out'
						}).bind(this);
				}

				var actionHidden = options.toastActionText === undefined;
				$('.toast-action-container', $toastEl).toggleClass('hidden', actionHidden);

				var timedCallback = function() {
					setTimeout(function(){
						options.toastActionCallback();
					}, 100);
				};

				if (!actionHidden) {
					$toastEl.off('click').on('click', timedCallback);
					$('.toast-action-container', $toastEl).on('click', function(){
						$(this).addClass('clicked');
					});
				}


				this.fixRotating($toastEl, options);

				if(options.hideAfter){
					Capriza.Toast._hideTOHandler = setTimeout(function(){
						Capriza.Toast.hide();
					},options.hideAfter);
				}
			},

			update: function($toastEl, options) {

				$('i', $toastEl).removeClass().addClass(options.toastIconClass);
				$('.text-major', $toastEl).text(options.textMajor || '');
				$('.text-minor', $toastEl).text(options.textMinor || '');
				$('.toast-action', $toastEl).html(options.toastActionText || '');
			},

			fixRotating: function($toastEl, options) {

				var rotatingSvg = document.getElementById("rotatingSvg");

				if (options.toastIconClass === 'rotating icon-loading') {
					$('i', $toastEl).addClass('hidden');
					rotatingSvg.setAttribute('class', 'special-spinner');
				}
				else {
					$('i', $toastEl).removeClass('hidden');
					rotatingSvg.setAttribute('class', 'special-spinner hidden');
				}
			},

			hide: function(options) {
				var $toastEl = $('.toast');

				$toastEl.velocity({
					translateY: 80
				}, {
					duration: 250,
					easing: 'out',
					complete: function() {
						$toastEl.remove();
					}
				});
				Capriza.Toast.unblock();
			},

			isShown: function(){
				return !!$('.toast')[0];
			},

			isBlocking: function(){
				return Capriza.Toast.isShown() && Capriza.Toast._blocked;
			},

			block: function(){
				Capriza.Toast._blocked = true;
				Utils.blockUI();
			},

			unblock: function(){
				Capriza.Toast._blocked = false;
				Utils.unblockUI();
			}
		}


	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/pageManager.js

try{
	/**
	 * Created by JetBrains WebStorm.
	 * User: yuval
	 * Date: 10/4/11
	 * Time: 9:38 AM
	 */

	(function(){

//on simulate mode the engine logger is injected instead of this dummy logger
		try {
			Element.to_s = function(node) {
				if (!node) return "NONE";
				if (node.nodeType === 3) return "#text:" + node.nodeValue;
				if (node.nodeType === 1) return node.tagName + (node.id ? "#" + node.id : "") + (node.getAttribute("class") ? "." + node.getAttribute("class").split(" ").join(".") : "");
			};
		} catch(ex) {}


		function setZoom(toEnabled) {
			var $meta = $("meta[name='viewport']"), val = toEnabled ? "yes" : "no";
			if ($meta.length) {
				var content = $meta.attr("content"), newContent = [];
				content = content.split(",");
				for (var i = 0, ii = content.length; i < ii; i++) {
					if (!/(user-scalable|((minimum|maximum)-scale))/.test(content[i]))
						newContent.push(content[i]);
				}
				val = "user-scalable=" + val;
				newContent.push(val);
				if (!toEnabled) {
					newContent.push("minimum-scale=1,maximum-scale=1");
				} else {
					newContent.push("minimum-scale=0.1,maximum-scale=10");
				}
				newContent = newContent.join(",");
				$meta.attr("content", newContent);
			} else {
				$("head").prepend("<meta>", { name: "viewport", content: "user-scalable=" + val });
			}
		}

		window.pageManager = {
			enableZoom: function() {
				setZoom(true);
			},

			disableZoom: function() {
				setZoom(false);
			},

			currentControls: [],

			onBackClick: function() {

				if ($.capriza.activePage.hasClass("page mini-browser active")) {
					$.capriza.backPage({ transition: "slide" });
					$("#mini-browser").attr("src", "");
					Dispatcher.trigger("miniBrowser/hide");
					return;
				}

				var pageView = $.capriza.activePage.data("pageView"), pageModel = pageView && pageView.model;

				// TODO: roadblock 29/9/2013 this should be erased (no backable and popoup anymore)
				if (pageModel && pageModel.get("backable")) {
					this.triggerEvent({ type: "back" });
					return;
				}
				// TODO: end of roadblock to-be-erased section

				if (pageModel && pageModel.get("backControl")) {
					this.triggerEvent({ type: "back", id: pageModel.get("backControl").id });
					$.capriza.showLoadingMsg();
					return;
				}

				// TODO: roadblock 29/9/2013 this should be erased (no backable and popoup anymore)
				if (pageModel && pageModel.get("popup")) {
					this.triggerEvent({ type: "close" });
					return;
				}
				// TODO: end of roadblock to-be-erased section


				if (pageModel && pageModel.tableDrill && !Capriza.device.isTablet) {
					$.capriza.backPage({ transition: "slide" });
					return;
				}

				$.capriza.backPage();
			},

			setRTL: function(isRTL) {
				Capriza.isRTL = isRTL;
			},

			generateDialog: function(response) {
				function doGenerateDialog() {
					Dispatcher.trigger("application/dialog/before");
					var dialogPage = $("<div>").cdialog(response);
					dialogPage.on("cdialogok", function(e, data) {
						if(!response.clientOnly){
							response.retVal = true;
							response.value = data.value || response.value;
							response.username = data.username || response.username;
							response.password = data.password || response.password;
							var event = {
								type : 'closeDialog',
								dialog : response
							};
							_this.triggerEvent(event);
						}
						$.capriza.currentDialog = undefined;
					});
					dialogPage.on("cdialogcancel", function(e, data) {
						if(!response.clientOnly){
							var event = {
								type : 'closeDialog',
								dialog : response
							};

							_this.triggerEvent(event);
						}
						$.capriza.currentDialog = undefined;
					});
					$.capriza.currentDialog = dialogPage;

					Dispatcher.trigger("application/dialog");
				}

				var _this = this;
				try {
					if ($.capriza.activePage && $.capriza.activePage.prop("id") && $.capriza.activePage.prop("id").indexOf("dialogpmt") > -1 &&
						$.capriza.currentDialog){
						$.capriza.currentDialog.remove();
						$.capriza.currentDialog = undefined;
					}
				}
				catch (ex) {
					Logger.error('Error');
				}

				doGenerateDialog();
			},

			generateError: function(options) {
				function hideError() {

					errorMsg.removeClass("shown");
					errorMsg.one("transitionend webkitTransitionEnd", function() {
						errorMsg.removeClass("active");
					});

					$(document).unbind("pagechange", hideError);
				}

				function onScrollWindow() {
					errorMsg.css("top", top);
					$(window).unbind("scroll", onScrollWindow);
				}

				options || (options = {});
				var top = 0;

				if (options.errorType && options.errorType == 'connectionLost' &&  Utils.isCachedBlueprintShown() && $(".unimessage").length) return;

				if (options.reconnect) {
					Logger.warn('got a reconnect error msg '+options.reconnect+' '+options.msg);
				} else {
					if ((Capriza.cordova || Capriza.isPhonegap) && Capriza.isStore &&
						(
							options.msg.indexOf('terminated') > -1 ||
							options.msg.indexOf('handshake') > -1 ||
							options.msg.indexOf('inactive') > -1 ||
							options.msg.indexOf('inactivity') > -1 ||
							options.closeZapp
						)) {
						Dispatcher.trigger('app/close', {Timeout: true});
						Logger.error('got disconnection message from the relay, send logs');
					} else {
						Dispatcher.trigger("loading/stopBlocking");
						Dispatcher.trigger('dialog/show', options);
					}
				}
			},

			hideReconnectingMessage: function() {
			},

			generateErrorPage: function(response) {
				try {
					//Logger through an exception and splash was stuck so, trying.
					var loglevel = response.fatal ? "error" : "debug";
					var msg = 'got error ';
					if(typeof response === "string"){
						msg += response;
					}
					else{
						msg += response.reason;
					}

					Logger[loglevel](msg, undefined, response.errorType);

				}
				catch (exc) {}

				if (response.nonFatal) {
					this.generateError({ msg: response.reason, errorType: response.errorType });
				} else {
					var error = {
						pageId: "errorPage"
					};

					if (response.page) {
						if (response.page.id)
							error.pageId += response.page.id;

						// TODO this API is obsolete and this whole method (generateErrorPage) should be dusted off ASAP
						if (response.page.backable || response.page.popup) {
							error.pageId += "_backable";
							error.addBackButton = true;
						}
					}

					if (response.vpnAccess) {
						Dispatcher.trigger('dialog/hide');
						appData.skipVpnError = true;
						Logger.debug('app has vpn access ('+response.data+')');

						var errorMesage = 'This Zapp may be private to a specific organization and as such, requires a VPN connection.' +
							' Please contact your system administrator for instructions how to install a VPN client on your device.<br><br><div id="refresh-msg-div">The app will refresh itself in<div id="refresh-counter">5 seconds</div></div>';

						var refreshFunc = function() {
							appData.skipVpnError = false;
							Utils.reload();
						};
						var renderAction = function(){

							var clearInter = function() {
								clearInterval(intervalId);
							};

							var counter = 5;
							var intervalId = setInterval(function(){
								var refreshCounterElement = $('#refresh-counter');
								$(refreshCounterElement).text(counter-1+' seconds');
								counter--;
								if (counter === 0 && $(refreshCounterElement).length > 0) {
									refreshFunc();
//                            }
//                            if (counter === -1) {
									clearInter();
								}
							}, 1000);
						};

						var messageOptions={
							topHeader:"VPN Connection Unavailable",
							message:errorMesage,
							buttonText:"Cancel",
							buttonAction:function(){
								$('#refresh-msg-div').empty();
								var btnElement = $('.button');
								$(btnElement).text('Retry');
								$(btnElement).click(function(){
									refreshFunc();
								});

							},
							renderAction: renderAction
						};

						Dispatcher.trigger("message/show",messageOptions);
					}
					else {

						var $page = $(Handlebars.templates.errorPage(error));
						var content = $page.children("div[data-role='content']");
						content.append($("<div></div>").text(response.reason));
						if (response.errorImg) {
							var image = {
								src: response.errorImg,
								width : '100%'
							};
							content.append($(Handlebars.templates.image(image)));
						}

						if (response.page && response.page.backable) {
							$("#customBackBtn_" + error.pageId, $page).click(function() {
								// TODO: check how to reset the zoom (setting maximum-scale doesn't work)
								// pageManager.disableZoom();
								pageManager.onBackClick();
							});
						}

						$page.appendTo('.viewport');
						$.capriza.changePage($page);
						// Check that Utils exists just in case the error occurred before loading the Utils
						if (window.Utils) {
							var message = {
								type: "error",
								messageText: Capriza.translator.getText("unHandleErrorTitle"),
								detailText: Capriza.translator.getText("unHandleErrorMsg"),//"An error occurred",
								actionText: Capriza.translator.getText("reload"),
								action: Utils.reload
							};
							if (Capriza.isStore) {
								message.extraActionText = Capriza.translator.getText("back");
								message.extraAction = Utils.backToList;
							}
							Utils.updateUnimessage(message, false, true);
						}
						pageManager.enableZoom();
					}
				}
			},

			updateControls: function(controlChanges) {
				_.each(controlChanges, function(update) {
					var model = Capriza.Model.Control.getById(update.id);
					if((Utils.isCachedMVPShown() || Utils.wasCachedMVPShown()) && Capriza.mcLastMobId[update.id] !== update.lastMsgId) { // TODO: make this work for all pages and not just MVP++ after dror implement in engine
						Logger.debug("Discard unsync'ed (mvppp) controlUpdate for " + update.id + " lastId : "+Capriza.mcLastMobId[update.id] + " this id: " + update.lastMsgId);
						return;
					}
					if (!model) return;
					if (update.validationError) {
						model.set("validationMessage", update.validationMessage);
					} else {
						var controls = update.data.controls;
						delete update.data.controls;
						model.set(update.data);
						controls && model.setControls(controls);
					}
					model.trigger("control/updated");
				});
			},

			refreshControls: function(controls) {
				Logger.trace('refreshControls started with '+controls);

				if (typeof controls !== 'object') {
					controls = JSON.parse(controls);
				}

				if (!(controls instanceof Array)) controls = [controls];
				controls.forEach(function(control) {
					var model = Capriza.Model.Control.getById(control.id);
					if (!model) {
						Logger.error('No Model found for '+control.id);
						return;
					}

					Logger.debug('refreshing '+control.id);

					var newModel = new Capriza.Model.Control(control, { parent: model.parent });

					newModel.addPage(model.pages);

					_.each(model.pages, function(page) {
						page.trigger("page/controlModified", model.get("id"));
					});
				});
				Dispatcher.trigger("page/update/after", {pageView: $.capriza.activePage.data('pageView')});
			},

			addLogo: function(url) {
				var img = new Image();
				img.src = url;
				$(".capriza-logo").fadeOut(function() { $(this).remove(); });
				var logoArea = $("<div class='capriza-logo'></div>").append(img).hide();
				$(".ui-mobile-viewport").addClass("has-logo").prepend(logoArea.fadeIn());
			},

			/**
			 * protocol is as follows:
			 * 2 options are possible:
			 *
			 * 1) initial download message indicates that download is ready (pending=false), so we show the download dialog
			 *
			 * 2) initial download message indicates that download is NOT ready (pending=true), so we show a dialog saying "preparing download..."
			 *    when another message comes with pending=false/undefined, then we change the dialog to the download dialog.
			 *
			 * @property resultType - always "download"
			 * @property pending - boolean
			 * @property src - the URL to download from. Also used as the unique ID for the download (for additional messages - pending/failed etc.)
			 * @property suggestedFilename
			 * @property failed - true indicates that the download failed
			 */
			downloadFile: function(response) {

				var $dialog, download = Capriza.downloads[response.src] || {}, filename = response.suggestedFilename;

				if (!filename) {
					var srcArr = response.src.split("/");
					filename = decodeURIComponent(srcArr[srcArr.length - 1]);
				}

				if (response.failed) {
					$dialog = download["$dialog"];
					if ($dialog && $dialog.length) {
						clearInterval(download.waitInterval);
						delete download.waitInterval;
						$dialog && $dialog.cdialog("setText", _.sanitize(filename) + "<br><br>Download has failed :-(").off("cdialogcancel", download["cancelDownload"]);
						$(".dialog-content", $dialog).addClass("error");
					}

					return;
				}

				if (!response.pending) {
					if (Capriza.cancelDownloads[response.src]){
						return;
					}

					$dialog = download["$dialog"];
					var text = "You are about to open :<br><br><b>" + _.sanitize(filename) + "</b><br><br>Are you sure?";
					if ($dialog && $dialog.length) {

						clearInterval(download.waitInterval);
						delete download.waitInterval;
						$dialog.cdialog("setText", text).cdialog("enable").off("cdialogcancel", download["cancelDownload"]);
						$(".dialog-ok button, .dialog-ok", $dialog).removeClass("disabled");
						var timeout = setTimeout(function() {
							$(".dialog-ok button, .dialog-ok", $dialog).addClass("disabled");
							$(".dialog-content", $dialog).addClass("error");
							$dialog.cdialog("setText", "You are about to open :<br><br><b>" + _.sanitize(filename) + "</b><br><br>Download timeout, please try again");
						}, 90000);
						$dialog.on("cdialogok", function() {

							Utils.Links.openExternal(response.src, filename);
							clearTimeout(timeout);
						});

					} else {

						$dialog = $("<div>").cdialog({ type: "confirm", header: "Open File", text: text, transition: "none", id: Date.now() })
							.on("cdialogok", function() {
								Logger.debug('clicking ok on dialog');
								Utils.Links.openExternal(response.src,filename);
							});

					}


				} else {

					var cancelDownload = function() {
						pageManager.triggerEvent({ "type" : "cancelDownload", "src": response.src });
					};
					delete Capriza.cancelDownloads[response.src];

					$dialog = $("<div>").cdialog({ type: "confirm", header: "Open File", text: filename + "<br><br>preparing download&nbsp;&nbsp;&nbsp;&nbsp;", transition: "expand", id: Date.now() })
						.on("cdialogcancel", function() {
							cancelDownload();
							clearInterval(interval);
							delete Capriza.downloads[response.src];
							Capriza.cancelDownloads[response.src] = true;
						});

					$(".dialog-ok button, .dialog-ok", $dialog).addClass("disabled");

					var counter = 1;
					var interval = setInterval(function() {
						var msg = filename + "<br><br>preparing download";
						for (var dotsCount = 0 ; dotsCount < counter; dotsCount++) msg += '.';
						for (var i = 0; i < 4 - counter; i++) msg += "&nbsp;";
						$dialog.cdialog("setText", msg);
						counter++;

						if (counter > 4) {
							counter = 0;
						}
					}, 500);

					Capriza.downloads[response.src] = {
						"waitInterval": interval,
						"$dialog": $dialog,
						"cancelDownload": cancelDownload
					};
				}
			}
		};

		Capriza.downloads = {};
		Capriza.cancelDownloads = {};

		var errorMsg;

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/widgets/widgets.js

try{
	(function($) {

		var testElement = document.createElement('div');

		var transformPrefix = "transform" in testElement.style ? "transform" : "webkitTransform";
		var transformProperty = $.capriza.transformProperty = transformPrefix === "webkitTransform" ? "-webkit-transform" : "transform";

		//wont work on input like '<div class=">fff">'
		_.sanitize = function (text) {
			if (typeof text == "string") {
				return text.replace(/<br\/?>/ig, " ").replace(/(<([^>]+)>)/ig, "");
			}
			return null;
		};

		var mapping = {"ban-circle":"ban","bar-chart":"bar-chart-o","beaker":"flask","bell-alt":"bell","bell":"bell-o","bitbucket-sign":"bitbucket-square","bookmark-empty":"bookmark-o","building":"building-o","calendar-empty":"calendar-o","check-empty":"square-o","check-minus":"minus-square-o","check-sign":"check-square","check":"check-square-o","chevron-sign-down":"chevron-circle-down","chevron-sign-left":"chevron-circle-left","chevron-sign-right":"chevron-circle-right","chevron-sign-up":"chevron-circle-up","circle-arrow-down":"arrow-circle-down","circle-arrow-left":"arrow-circle-left","circle-arrow-right":"arrow-circle-right","circle-arrow-up":"arrow-circle-up","circle-blank":"circle-o","cny":"rub","collapse-alt":"minus-square-o","collapse-top":"caret-square-o-up","collapse":"caret-square-o-down","comment-alt":"comment-o","comments-alt":"comments-o","copy":"files-o","cut":"scissors","dashboard":"tachometer","double-angle-down":"angle-double-down","double-angle-left":"angle-double-left","double-angle-right":"angle-double-right","double-angle-up":"angle-double-up","download-alt":"download","download":"arrow-circle-o-down","edit-sign":"pencil-square","edit":"pencil-square-o","ellipsis-horizontal":"ellipsis-h","ellipsis-vertical":"ellipsis-v","envelope-alt":"envelope-o","exclamation-sign":"exclamation-circle","expand-alt":"expand-o","expand":"caret-square-o-right","external-link-sign":"external-link-square","eye-close":"eye-slash","eye-open":"eye","facebook-sign":"facebook-square","facetime-video":"video-camera","file-alt":"file-o","file-text-alt":"file-text-o","flag-alt":"flag-o","folder-close-alt":"folder-o","folder-close":"folder","folder-open-alt":"folder-open-o","food":"cutlery","frown":"frown-o","fullscreen":"arrows-alt","github-sign":"github-square","google-plus-sign":"google-plus-square","group":"users","h-sign":"h-square","hand-down":"hand-o-down","hand-left":"hand-o-left","hand-right":"hand-o-right","hand-up":"hand-o-up","hdd":"hdd-o","heart-empty":"heart-o","hospital":"hospital-o","indent-left":"outdent","indent-right":"indent","info-sign":"info-circle","keyboard":"keyboard-o","legal":"gavel","lemon":"lemon-o","lightbulb":"lightbulb-o","linkedin-sign":"linkedin-square","meh":"meh-o","microphone-off":"microphone-slash","minus-sign-alt":"minus-square","minus-sign":"minus-circle","mobile-phone":"mobile","moon":"moon-o","move":"arrows","off":"power-off","ok-circle":"check-circle-o","ok-sign":"check-circle","ok":"check","paper-clip":"paperclip","paste":"clipboard","phone-sign":"phone-square","picture":"picture-o","pinterest-sign":"pinterest-square","play-circle":"play-circle-o","play-sign":"play-circle","plus-sign-alt":"plus-square","plus-sign":"plus-circle","pushpin":"thumb-tack","question-sign":"question-circle","remove-circle":"times-circle-o","remove-sign":"times-circle","remove":"times","reorder":"bars","resize-full":"expand","resize-horizontal":"arrows-h","resize-small":"compress","resize-vertical":"arrows-v","rss-sign":"rss-square","save":"floppy-o","screenshot":"crosshairs","share-alt":"share","share-sign":"share-square","share":"share-square-o","sign-blank":"square","signin":"sign-in","signout":"sign-out","smile":"smile-o","sort-by-alphabet-alt":"sort-alpha-desc","sort-by-alphabet":"sort-alpha-asc","sort-by-attributes-alt":"sort-amount-desc","sort-by-attributes":"sort-amount-asc","sort-by-order-alt":"sort-numeric-desc","sort-by-order":"sort-numeric-asc","sort-down":"sort-asc","sort-up":"sort-desc","stackexchange":"stack-overflow","star-empty":"star-o","star-half-empty":"star-half-o","sun":"sun-o","thumbs-down-alt":"thumbs-o-down","thumbs-up-alt":"thumbs-o-up","time":"clock-o","trash":"trash-o","tumblr-sign":"tumblr-square","twitter-sign":"twitter-square","unlink":"chain-broken","upload-alt":"upload","upload":"arrow-circle-o-up","warning-sign":"exclamation-triangle","xing-sign":"xing-square","youtube-sign":"youtube-square","zoom-in":"search-plus","zoom-out":"search-minus"};

		var widgets = {

			listbox: {

				_create: function() {
					this.element.addClass("listbox").attr("id", this.options.uniqueControlId);

					var valElement = $('<div class="pulldownmenu value"><div class="parent"><span></span><div class="pulldownmenu-icon"></div></div></div>').appendTo(this.element);
					this.proxyElement = $("span", valElement);
					this.selectElement = $('<select id="' + this.options.uniqueControlId + 'select"></select>').appendTo(valElement);

					var self = this;
					if (!this.options.enableMobiscroll) {
						this.selectElement.on("change", function (e) {
							self._setTextOnProxy();
							self._trigger("change", e, { selectedIndex: self.selectElement.prop("selectedIndex") });
						});
					}

				},

				setSelectedIndex: function(index) {
					var self = this;
					if(Array.isArray(index)){
						var options = this.selectElement.prop('options');
						Array.prototype.forEach.call(options, function (option, optionIndex) {
							option.selected = index.indexOf(optionIndex) > -1;
						});
					}else{
						this.selectElement.prop("selectedIndex", index);
						setTimeout(function() {
							self.selectElement.prop("selectedIndex", index);
						}, 0);
					}

					this._setTextOnProxy();
				},

				htmlEncode: function(value) {
					return $('<div/>').text(value).html();
				},

				setItems: function(values) {

					var $select = $('select', this.element);
					$select.empty();

					var selectedIndex = $select.prop("selectedIndex"), self = this;
					_.each(values, function(item) {
						var option = $('<option value="'+item.id+'">'+self.htmlEncode(item.value)+'</option>');
						item.disabled && option.prop("disabled", true);
						$select.append(option);
					});
					$select.prop("selectedIndex", selectedIndex);
					this._setTextOnProxy();
				},

				_setTextOnProxy: function() {
					var selectedIndex = this.selectElement.prop("selectedIndex");
					if (selectedIndex == -1) {
						this.proxyElement.text("");
					} else {
						this.proxyElement.text(this.selectElement[0].options[selectedIndex].textContent);
					}

				}
			},

			realButton: {

				_create: function() {

					if (this.element.prop("tagName").toUpperCase() !== "BUTTON") {
						this.$button = $("<button>").appendTo(this.element);
					} else {
						this.$button = this.element;
					}

					this.$button.addClass("real-button");
					this.option("$button", this.$button);

					if (!this.element.attr("id")) {
						this.element.attr("id", this.options.uniqueControlId);
					}

					this.setText(this.options.name || " ");
					if (this.options.subtype) {
						this.setSubtype(this.options.subtype);
					}
					if(this.options.icon)
						this.setIcon(this.options.icon);

					this.fastclick = $.capriza.fastClick(this.$button[0], {highlightDuration: 500});

					var self = this;
					this.element.on("click", function(e) {
						self._trigger("_click");
						e.stopPropagation();
//                    return false;
					});
				},

				setText: function(text) {
					this.$button.text(_.sanitize(text));
				},

				setSubtype: function(subtype) {
					this.subtype && this.$button.removeClass("btn-" + this.subtype);
					this.subtype = subtype;
					this.$button.addClass('btn-' + subtype);
				},

				setIcon: function(iconClass) {
					var icon = this.$button.children("i");
					if (icon.length==0)
						icon = $("<i></i> ");

					var newIconClass = iconClass;
//                if (iconClass.indexOf('icon-') > -1) {
//                    newIconClass = this.getNewIcon(iconClass);
//                }

					var iconDisplay = this.options.iconDisplay;
					if (iconDisplay) {
						icon.attr("class",newIconClass+' '+iconDisplay);
					}
					else {
						icon.attr("class",newIconClass);
					}


					if (iconDisplay === 'icon_right') {
						icon.appendTo(this.$button);
					}
					else {
						icon.prependTo(this.$button);
					}

				},

				getNewIcon: function(oldClass) {

					var iconClassValue = oldClass.replace('icon-', '');
					var newIcon = mapping[iconClassValue];

					if (newIcon) {
						return 'fa fa-'+newIcon;
					}
					else {
						return 'fa fa-'+iconClassValue;
					}

				}
			},

			paginatorButton: {
				_init: function() {
					var _this = this;
					this.element.addClass("paginator-button").addClass(this.options.type);
					if (this.options.disabled)
						this.element.addClass("disabled");
					this.element.on("click", function(e) {
						if (_this.options.disabled)
							e.stopPropagation();
						else {
							_this.options.disabled = true;
							_this.element.addClass("disabled");
							_this._trigger("_click", e);
						}
					});
				}
			},

			pulldownmenu: {
				_create: function() {
					var _this = this;
					this.$pulldownmenu = this.element;
					var parent = $("<div class='parent'>").appendTo(this.element).on("click", _.bind(this.toggleItems, this));
					var $label = $("<span></span>").text(this.options.name || "").appendTo(parent);
					var icon = $("<div class='pulldownmenu-icon'></div>").appendTo(parent);
					this.element.addClass("pulldownmenu value");

					this._initItems();

					this.fillItems(this.options.items);

					if (typeof this.options.selectedIndex === "number") {
						this.setSelectedItem(this.options.selectedIndex);
					}
				},

				_initItems: function() {
					var _this = this;
					this.$items = $("<ul class='children'></ul>").appendTo(this.$pulldownmenu);
					this.$items.delegate("li.child", "click", function(e) {
						widgets.pulldownmenu.hideItems.apply(_this, arguments);
						var $li = $(this), index = $li.data("index");
						_this._trigger("_itemclick", e, { value: $li.text(), index: index });
						if (!_this.options.dontUpdate) {
							_this.setValue($(this).text());
							_this.setSelectedItem(index);
						}
					});
				},

				toggleItems: function(e) {
					this.isOpen ? this.hideItems(e) : this.showItems(e);
					return false;
				},

				showItems: function(e) {
					var self = this;
					this.element.addClass("open");
					var menuHeight = this._calcHeight(this.options.items);
					this.element.addClass("opening");
					this.$items.transition({height: menuHeight, opacity: 1}, 150, 'linear', function(){
						Dispatcher.trigger("menu/open", this);
						self.element.removeClass("opening");

						// #8903. Causes the menu to refresh. Sometimes it is not refreshed and the menu is half-transitioned.
						self.$items.get(0).getBoundingClientRect();
					});
					this.isOpen = true;
				},

				hideItems: function(e) {
					var _this = this;
					this.element.addClass("closing");
					this.$items.transition({height: 0, opacity: 0}, 150, 'linear', function(){
						_this.$pulldownmenu.removeClass("open");
						Dispatcher.trigger("menu/close", this);
						_this.element.removeClass("closing");
					});
					e.stopPropagation();
					this.isOpen = false;
				},

				fillItems: function(items, container) {
					var self = this;
					container = (container || self.$items);
					container.empty();
					this._setOption("items", items);
					_.each(items, function(item, index) {
						$("<li class='child'>" + item + "</li>").data("index", index).appendTo(container || self.$items);
					});
				},

				setSelectedItem: function(index) {
					if (typeof index !== 'number') return;

					$("li.child", this.$items).each(function(i, li) {
						if (index === i) {
							$(li).addClass("selected");
						} else {
							$(li).removeClass("selected");
						}
					});
				},

				_calcHeight: function(items) {
					var $items = $("<div class='children'></div>").appendTo(this.$pulldownmenu);
					widgets.pulldownmenu.fillItems.call(this, items, $items);
					$items.css("height", "auto");
					var ret = $items.height();
					$items.remove();
					return ret;
				},

				setValue: function(val) {
					$(".parent span", this.element).text(val || "");
				}
			},

			cdialog: {
				_init: function() {
					var _this = this;
					var types = { alert : "Alert", prompt : "Prompt", confirm : "Confirm", promptAuth : "Authentication", promptPassword : "Password" };
					var $body, $content, $buttonBar;

					this.element.attr("id", "dialog" + this.options.id).addClass("cdialog " + this.options.type).addClass("page").data("page", true).appendTo(".viewport");
					$("<div class='dialog-header'><h1 class='value'>" + (this.options.header || types[this.options.type]) + "</h1></div>").appendTo(this.element);
					$body = $("<div>").addClass("dialog-body").appendTo(this.element);
					$content = $("<div class='dialog-content'></div>").html(this.options.text || "").appendTo($body);
					switch (this.options.type) {
						case "prompt":
							$('<div class="textbox ss-dss_stdInput"><div class="value"><input type="text" name="dialog-value" id="dialog-value" placeholder="Type here"/></div></div>').appendTo($content);
							break;
						case "promptAuth":
							$('<div class="textbox ss-dss_stdInput"><label for="dialog-username">Username:</label><div class="value"><input type="text" placeholder="Username" id="dialog-username"/></div></div>').appendTo($content);
						case "promptPassword":
							$('<div class="textbox ss-dss_stdInput"><label for="dialog-password">Passowrd:</label><div class="value"><input type="password" placeholder="Password" id="dialog-password"/></div></div>').appendTo($content);
							break;
						default:
							break;
					}
					$buttonBar = $("<div class='button-bar'></div>").appendTo(this.element);
					$("<div class='ss-dss_button_full_width ss-dss_allButton ss-dss_bold ss-dss_textButton'><button class='value'><i class='fa fa-check'></i>" + (this.options.okButton || "OK") + "</div>").addClass("dialog-ok").appendTo($buttonBar).on("click", function(e) {
						if (this.querySelector("button").classList.contains("disabled")) return false;
						var data = {
							value: $("#dialog-value", _this.element).val(),
							username: $("#dialog-username", _this.element).val(),
							password: $("#dialog-password", _this.element).val()
						};
						onDialogButtonPress("ok", e, data);
					});
					if (this.options.type !== "alert") {
						$("<div class='ss-dss_button_full_width ss-dss_allButton ss-dss_bold ss-dss_textButton'><button class='value'><i class='fa fa-times'></i>Cancel</div>").addClass("dialog-cancel").appendTo($buttonBar).on("click", function(e) {
							if (this.querySelector("button").classList.contains("disabled")) return false;
							onDialogButtonPress("cancel", e);
						});
					}

					function onDialogButtonPress(method, e, data){
						_this._trigger(method, e, data);

						// remove the dialog element, not necessarily the last element...
						var newPages = [];
						$.capriza.pages.forEach(function(item){
							if (!item.hasClass('cdialog'))
								newPages.push(item);
						});

						$.capriza.pages = newPages;
						var latestPage = $.capriza.pages[$.capriza.pages.length - 1];
						var pageView = latestPage && latestPage.data('pageView');
						if (pageView) {
							pageView.show({ transition: _this.options.transition, ignoreModalDrill: true, reverse: true , callback: function(){
								_this.element.remove();
							}});
						}
						else {
							_this.element.remove();
							//also remove it from the active page pointer
							if ($.capriza.activePage && $.capriza.activePage.hasClass('cdialog')) {
								$.capriza.activePage = latestPage;
							}
						}

					}

					$(".cdialog.active").removeClass("active");
					var modalToModal =  $(".page.active.page-modal").length;
					Capriza.Views.preparePageModal(this.element, {modalToModal: modalToModal});
					if (modalToModal){
						this.options.transition = "fade";
					}
					$.capriza.changePage(this.element, { transition: this.options.transition, ignoreModalDrill: true, isModal: true});
				},

				setText: function(text) {
					$(".dialog-content", this.element).html(text);
				},

				enable: function() {
					$("button", this.element).removeClass("disabled");
				},

				disable: function() {
					$("button", this.element).addClass("disabled");
				}
			},

			link: {

				options: {
					zoomEffect: null,
					icon: null
				},

				_create: function() {
//                if (this.element.prop("tagName").toLowerCase() !== "a") return;
					this.$text = $("<span>").text(_.sanitize(this.options.name) || " ");
					this.$inner = $("<a class='value styleable-text' href='#'>").append(this.$text);
					this.element.attr("id", this.options.uniqueControlId || "").addClass("link").append(this.$inner);

					var _this = this;

					//this.fastClick = $.capriza.fastClick(this.element[0]);

					this.$inner.on("click", function() {
						if (!_this.options.isDisabled) {
							_this._trigger("_click");
							return false;
						}
					});

					if (this.options.zoomEffect) {
						this.element.on("click", function() {
							$(this).addClass('zoom');
						});
						this.element.on("webkitAnimationEnd animationend", function() {
							$(this).removeClass('zoom');
						});
					}

					this.setIcon(this.options.icon);
				},

				setIsDisabled: function(disabled){
					this._setOption("isDisabled", disabled);
				},

				setText: function(text) {
					this._setOption("name", text);
					this.$text.text(_.sanitize(this.options.name));
				},

				setIcon: function(iconClass) {
					if (!iconClass) {
						this.element.removeClass("has-icon");
						$("i:first", this.element).remove();
						return;
					}

					this.element.addClass("has-icon");

					var icon = this.$inner.children("i");
					if (icon.length==0)
						icon = $("<i></i> ").prependTo(this.$inner);

					var newIconClass = iconClass;
					if (iconClass.indexOf('icon-') > -1) {
						newIconClass = this.getNewIcon(iconClass);
					}

					icon.attr("class",newIconClass);
				},

				getNewIcon: function(oldClass) {

					var iconClassValue = oldClass.replace('icon-', '');
					var newIcon = mapping[iconClassValue];

					if (newIcon) {
						return 'fa fa-'+newIcon;
					}
					else {
						return 'fa fa-'+iconClassValue;
					}

				}

//            setIsDisabled: function (isDisabled) {
//                this.element.toggleClass("disabled", isDisabled);
//            }

			},

			image: {
				_create: function () {
					var _this = this;
					this.element.attr("id", this.options.uniqueControlId || "").addClass('image-container');


					this.$imageElement = $("<img>");
					this.$placeHolder = $("<img class='image image-placeholder'>");
					this.$imageElement.addClass("image").attr("alt", this.options.alt || this.options.key || "");
					if (this.options.style && this.options.style.width) {
						this.$imageElement.css("width", this.options.style.width + "px");
						this.$imageElement.css("height", this.options.style.height + "px");
					}


					this.$imageElement.appendTo(this.element);
					//this.$placeHolder.appendTo(this.element);

					//setTimeout(function(){
					//    _this.$placeHolder[0].style.cssText = document.defaultView.getComputedStyle(_this.$imageElement[0], "").cssText;
					//}, 0);



					var height = this.$imageElement.height();

					this.element.on("click", function (e) {

						if (_this.options.enableZoom) {
							var $originalViewport;
							$.swipebox([
									{href: _this.options.src, title: _this.options.key || "Image"}
								],
								{beforeOpen: function () {

									if(Capriza.device.isMobile)
										$('.viewport').css({visibility: 'hidden'});
									$originalViewport = $('meta[name="viewport"]');
									$originalViewport.remove();
									$("<meta>", {content: "width=device-width, initial-scale=1, user-scalable=yes, maximum-scale=3.0", name: 'viewport'}).appendTo('body');
									$("<meta>", {content: "initial-scale=1, user-scalable=yes, , maximum-scale=3.0", name: 'viewport', media: '(device-height: 568px)'}).appendTo('body');

//                               stock browser doesn't handle code meta viewport updates until orientation change. Doubling image size.
									if (Capriza.device.stock) {
										var loadListener = setInterval(function () {
											logger.log('interval');
											var $swipeImg = $('#swipebox-overlay img');
											if ($swipeImg.length == 0) {
												return;
											}

											clearInterval(loadListener);

											$swipeImg.css({width: $swipeImg.width() * 2})

										}, 100);


									}
									setTimeout(function(){
											$('#swipebox-close').on('touchend',function(e){
												e.stopPropagation();
												return false;
											})
										}
										,0)
								}, afterClose: function () {
									$('meta[name="viewport"]').remove();
									$originalViewport.appendTo('body');
									if(Capriza.device.isMobile){
										$('.viewport').css({visibility: ''});

									}
									return false;
								}
								}
							);

							return false;
						}
						return _this._trigger("_click");
					});
				},

				onLoad: function(callback) {
					this.$imageElement.on('load', callback);
				},

				addClassToImage: function(className) {
					this.$imageElement.addClass(className);
				},

				hidePlaceHolder: function() {
					this.$placeHolder.addClass('hidden');
				},

				removeClassToImage: function(className) {
					this.$imageElement.removeClass(className);
				},

				setSrc: function(src) {
					this.options.src=src;
					this.$imageElement.attr("src", src);
				},

				setBackgroundImage: function(src, position, size) {
					this.$imageElement.css('background', "url("+src+") no-repeat scroll "+position+" transparent").css('background-size',size).css('color', 'transparent');
					this.$imageElement.attr("src", 'data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw==');
				}
			},

			file: {
				_create: function () {
					function uploadFile (filePath,file) {
						function nameFinder(filePath, seperator) {
							if (filePath.indexOf(seperator) == -1) {
								return filePath;
							}
							var fileName = filePath.split(seperator);
							return fileName[fileName.length - 1];
						}

						function getFileName(filePath){
							var fileName = nameFinder(filePath, '/');
							fileName = nameFinder(fileName, '\\');
							return fileName;
						}

						function uniqueness(fileName){
							var name = fileName;
							// Relay does not support multiple files with same name in same session
							$.capriza.fileSequence = $.capriza.fileSequence || {};
							if($.capriza.fileSequence[fileName]) name = name.replace(/\.(?=[^.]*$)/, "_" + $.capriza.fileSequence[fileName]+ ".");
							$.capriza.fileSequence[fileName] = ($.capriza.fileSequence[fileName] || 0) + 1;
							return name;
						}

						var _this=this;
						var fileName = getFileName(filePath);
						fileName = uniqueness(fileName); // Relay does not support multiple files with same name in same session
						_this.$input.val(fileName);
						var uploadForm = new FormData();
						uploadForm.append(fileName, file);

						if (window.isDesignerPreview) {
							// save file input to allow for privileged access in the designer
							Capriza.localFile = $fileInput[0];
							_this._trigger('set', 'file', {fileLocation: filePath});

						} else {
							var uploadPath = appData.session_id + "/" + fileName;
							var uploadUrl = appData.runtime_base_url + "/imageUpload/" + uploadPath;
							Logger.debug('upload url: ' + uploadUrl);

							Dispatcher.trigger('loading/start');
							Logger.debug('uploadForm: ' + uploadForm);

							$.ajax({
								url: uploadUrl,
								data: uploadForm,
								processData: false,
								contentType: false,
								type: 'PUT',
								success: function (data) {
									_this._trigger('set', 'file', {fileLocation: uploadPath});
								},
								error: function (e) {
									alert('File format not allowed, please choose a different file.');
									Logger.debug('Failed to upload file. ' + e);
								},
								complete: function () {
									Dispatcher.trigger('loading/stop');
								}
							});
						}
					}

					var _this = this;
					this.element.addClass("file").addClass("actionableInput").attr("id", this.options.uniqueControlId);
					var $wrapper = $('<div/>').css({height: 0, width: 0, 'overflow': 'hidden'});

					var $ctrlToDisplay = $('<div>');

					var placeholder = this.options.placeholder ? " placeholder='" + this.options.placeholder + "' " : "";
					this.$input = $('<input type="text" readonly=""' + placeholder + '>').addClass('styleable-text').appendTo($ctrlToDisplay);

					if (this.options.icon) {
						var $icon = $('<span>').addClass("icon icon-label").appendTo($ctrlToDisplay);
						$('<i>').addClass(this.options.icon).appendTo($icon);
					}

					var $fileInput = $('<input>', {id: this.options.uniqueControlId + "_file", name: this.options.uniqueControlId + "_file", type: 'file'});
					$fileInput.attr("tabindex", -1).appendTo(this.element);

					$ctrlToDisplay.addClass('value').appendTo(this.element);
					$ctrlToDisplay.attr("aria-roledescription", "file upload");
					$fileInput.wrap($wrapper);

					$fileInput.change(function () {
						var filePath=$fileInput.val();
						var file=$fileInput.prop('files')[0];
						uploadFile.call(_this,filePath, file);
					});

					$ctrlToDisplay.click(function () {
						$fileInput.click();
					});
				}
			},

			swipe: {
				options: {
					swipeRightArgs: [],
					swipeLeftArgs: []
				},

				removeSwipe: function() {
					this.element.off('touchstart mousedown');
					this.element.off('touchmove mousedown');
					this.element.off('touchend mousedown');
					this.element.data('swipe', false);
				},

				_create: function() {
					var self = this;
					this.element.on('touchstart mousedown', function(e) {
						if (self.options.onStart) {
							requestAnimationFrame(self.options.onStart);
						}
						var curX, curY;
						if (window.event && event.touches && event.touches.length === 1) {
							var startX = event.touches[0].pageX, startY = event.touches[0].pageY;
							self.element.off('touchmove mousemove').on('touchmove mousemove', function(e) {
								e.stopPropagation();

								curX = event.targetTouches && event.targetTouches[0].pageX - startX;
								curY = event.targetTouches && event.targetTouches[0].pageY - startY;

								if (Math.abs(curX) > Math.abs(curY)) {
									event.preventDefault();
								}
							});

							self.element.off('touchend mouseup').on('touchend mouseup', function(e) {

								if (Math.abs(curX) > Math.abs(curY)+100) {

									if (curX < 0) {
										self.options.swipeRight.apply(this, self.options.swipeRightArgs);
									}
									else{
										self.options.swipeLeft.apply(this, self.options.swipeLeftArgs);
									}

									curX = 0;
									curY = 0;

								}
							});
						}
					});
				}
			},

			mouseSwipe: {
				options: {
					swipeRightArgs: [],
					swipeLeftArgs: []
				},

				_create: function() {
					var self = this;
					this.element.on('mousedown', function(e) {

						self.options.onStart && self.options.onStart();

						var curX, curY;
						var startX = e.pageX, startY = e.pageY;
						self.element.off('mousemove').on('mousemove', function(e) {

							curX = e.pageX - startX;
							curY = e.pageY - startY;

							if (Math.abs(curX) > Math.abs(curY)) {
								e.preventDefault();
							}
						});

						self.element.off('mouseup').on('mouseup', function(e) {

							if (Math.abs(curX) > Math.abs(curY)+100) {
								if (curX < 0) {
									self.options.swipeRight.apply(this, self.options.swipeRightArgs);
								}
								else{
									self.options.swipeLeft.apply(this, self.options.swipeLeftArgs);
								}

								curX = 0;
								curY = 0;

							}
						});
					});
				}
			},

			drag: {

				calcVelocity: function(distance, startTime, endTime) {

					var totalTime = endTime-startTime;

					return distance/totalTime;

				},

				shouldCompleteAction: function(velocity, curXAbs) {
					var threshold = this.options.threshold || 0.75;
					return (velocity > 0.4 || curXAbs >= this.element.parent().width()*threshold);
				},

				reset: function(curItemX) {
					this.options.onCancel(curItemX, this.element, this.step, transformProperty);
				},

				NO_DRAG: 0,
				SIGNAL_START: 1,
				START_TRIGGERED: 2,

				_create: function() {
					this.step = {swiping: false, toSet: undefined, isStarted:self.NO_DRAG};
					//isStarted == 0 => no drag occurred (self.NO_DRAG)
					//isStarted == 1 => drag signal from touchmove (self.SIGNAL_START)
					//isStarted == 2 => start event sent from requestAnimationFrame (self.START_TRIGGERED)

					this.onTouchStart = _.bind(this.onTouchStart, this);
					this.onTouchMove = _.bind(this.onTouchMove, this);
					this.onTouchEnd = _.bind(this.onTouchEnd, this);
					this.update = _.bind(this.update, this);

					this.element.on('touchstart', this.onTouchStart);
				},

				update: function() {
					if (this.options.isSwipeDisable && this.options.isSwipeDisable())
						return;
					if(this.step.direction && this.step.isStarted == this.SIGNAL_START){
						this.step.isStarted = this.START_TRIGGERED;
						this.options.onStart && this.options.onStart(this.step);
					}
					if (this.step.toSet !== undefined) {
						this.options.dragCallback(this.step, transformProperty);
					}
					this.options.animationFrameId && cancelAnimationFrame(this.options.animationFrameId);
					this.options.animationFrameId = requestAnimationFrame(this.update);
				},

				onTouchStart: function(e) {
					e.stopPropagation();

					requestAnimationFrame(this.update);
					if (event.touches.length === 1 && !(this.options.isSwipeDisable && this.options.isSwipeDisable())) {
						var touchObj = this.touchObj = {
							curItemX: this.element[0].getBoundingClientRect().left,
							startTime: Date.now()
						};

						touchObj.startX = event.touches[0].pageX;
						touchObj.startY = event.touches[0].pageY;
						this.element.off('touchmove').on('touchmove', this.onTouchMove);
						this.element.off('touchend touchcancel').on('touchend touchcancel', this.onTouchEnd);
					}
				},

				onTouchMove: function(e) {
					e.stopPropagation();
					var curX = this.touchObj.curX = event.targetTouches[0].pageX - this.touchObj.startX;
					var curY = this.touchObj.curY = event.targetTouches[0].pageY - this.touchObj.startY;

					if (Math.abs(curX) > Math.abs(curY)*1.2) {

						this.step.pageX = event.targetTouches[0].pageX;
						this.step.curX = curX;
						this.step.toSet = this.touchObj.curItemX + curX;

						event.cancelable && event.preventDefault();

						if(!this.step.isStarted){
							this.step.isStarted = this.SIGNAL_START;
						}

						if (curX > 0) {
							this.step.direction = 'right';
						}
						else {
							this.step.direction = 'left';
						}
					}
				},

				onTouchEnd: function(e) {
					this.element.off('touchmove');
					e.stopPropagation();
					this.options.animationFrameId && cancelAnimationFrame(this.options.animationFrameId);
					if (!this.step.toSet) return;
					this.step.toSet = undefined;
					this.step.isStarted = this.NO_DRAG;

					if (this.touchObj.curX === undefined || isNaN(this.touchObj.curX)) return;

					var endTime = Date.now(), velocity = this.calcVelocity(Math.abs(this.touchObj.curX), this.touchObj.startTime, endTime),
					    curXAbs = Math.abs(this.touchObj.curX),
					    completeAction = this.options.shouldCompelteAction ?
						    this.options.shouldCompelteAction(velocity, curXAbs) :
						    this.shouldCompleteAction(velocity, curXAbs);

					if (completeAction && !(this.options.isSwipeDisable && this.options.isSwipeDisable())) {
						if (this.step.direction === 'right') {
							this.options.swipeLeft.apply(this, [this.element,velocity, curXAbs]);
						}
						else {
							this.options.swipeRight.apply(this, [this.element, velocity, curXAbs]);
						}
					}
					else {
						this.reset(this.touchObj.curItemX);
					}
				}
			},

			rotatingSpinner: {
				_create: function() {
					var options = _.extend({display: 'hidden'}, this.options);

					var brand = Utils.getBrand();

					if (brand) {
						options = _.extend({primaryColor: brand['primary-color']}, options);
					}


					this.element.append(Handlebars.templates['spinner'](options));
				}
			},

			sticky: {
				_create: function () {
					_.bindAll(this, "initSticky", "doStickyScroll");

					this.placeholder = document.createElement('div');
					this.$scrollingArea = undefined;
					this.initSticky();
					document.removeEventListener('DOMNodeInserted', this.initSticky);
					document.addEventListener('DOMNodeInserted', this.initSticky);
				},

				initSticky: function () {
					var self = this;

					var $newScrollingArea = $(".scrolling-area");
					if (this.$scrollingArea && this.$scrollingArea.length && $newScrollingArea.length && this.$scrollingArea[0] === $newScrollingArea[0]) return;
					if (this.$scrollingArea) {
						this.$scrollingArea.off('scroll', this.doStickyScroll);
					}
					this.$scrollingArea = $newScrollingArea;

					var $scrollingArea = this.$scrollingArea;
					if (!$scrollingArea.length) return;

					var $stickyEl = this.$stickyEl = this.element;

					this.isAdded = false;
					this.stickyParentPosition = {};
					this.scrollablePosition = {};
					this.stickyTop = "";

					setTimeout(function () {
						self.stickyParentPosition = $stickyEl[0].getBoundingClientRect();
						self.stickyTop = $stickyEl[0].style.top;
						self.scrollablePosition = $scrollingArea.position();
						self.placeholder.style.width = $stickyEl.width() + 'px';
						self.placeholder.style.height = $stickyEl.height() + 'px';
					}, 0);

					$scrollingArea.off('scroll', this.doStickyScroll);
					$scrollingArea.on('scroll', this.doStickyScroll);
				},

				doStickyScroll: function() {
					if (this.$scrollingArea.scrollTop() >= (this.stickyParentPosition.top - this.scrollablePosition.top) && !this.isAdded) {
						this.$stickyEl.addClass('sticky');
						this.$stickyEl.css({top: this.scrollablePosition.top + 'px', width: this.placeholder.style.width});
						this.$stickyEl[0].parentNode.insertBefore(this.placeholder, this.$stickyEl[0]);
						this.isAdded = true;
					} else if (this.$scrollingArea.scrollTop() < (this.stickyParentPosition.top - this.scrollablePosition.top) && this.isAdded) {
						this.$stickyEl.removeClass('sticky');
						this.$stickyEl[0].parentNode.removeChild(this.placeholder);
						this.$stickyEl[0].style.top = this.stickyTop;
						this.isAdded = false;
					}
				},

				_destroy: function () {
					if (this.$scrollingArea) {
						this.$scrollingArea.off('scroll', this.doStickyScroll);
					}
				}
			}
		};

		widgets['popupmenu'] = _.extend(_.extend({}, widgets.pulldownmenu), {
			toggleItems: function(e) {
				this.isOpen ? this.hideItems(e) : this.openEmpty(e);
				return false;
			},

			openEmpty: function() {
				var self = this;
				this.$pulldownmenu.addClass("open");
				this.$items.empty();
				this.$items.css({ height: 50, opacity: 1 });
				$("<div class='popupmenu-loading'></div>").appendTo(this.$items);
				this._trigger("_openpopup");
				this.element.addClass("opening");
				this.$items.on("transitionend webkitTransitionEnd", function() {
					Dispatcher.trigger("menu/open", this);
					self.element.removeClass("opening");
				});
				this.isOpen = true;
			},

			fillItems: function(items) {
				if (!items || !items.length) return;
				if (!this.isOpen) {
					this.element.addClass("open");
					this.$items.empty();
					this.isOpen = true;
				}
				$(".popupmenu-loading", this.element).remove();
				widgets.pulldownmenu.fillItems.apply(this, arguments);
				var menuHeight = this._calcHeight(items);

				if (this.element.parents('.active').length > 0) {
					this.$items.css({ height: menuHeight, opacity: 1 });
				}

			},

			hideItems: function() {
				this._trigger("_closepopup");
				widgets.pulldownmenu.hideItems.apply(this, arguments);
			}
		});

		widgets["loadingShellMode"] = {
			_create: function() {
				this.element.addClass("spinner loading-shellmode").appendTo(".viewport");
			}
		};

		var widgetPrototype = Capriza.widgetPrototype = {
			onInserted: function(callback) {
				var _this = this;
				$(document).bind("DOMNodeInserted", function(e) {
					var element = _this.element.get(0);
					if (element === e.target || (element.compareDocumentPosition(e.target) & element.DOCUMENT_POSITION_CONTAINS)) {
						$(document).unbind("DOMNodeInserted", arguments.callee);
						callback(e);
					}
				});
			},

			_create: function() {
				this.options.onInserted && this.onInserted(this.options.onInserted);
			}
		};

		_.each(widgets, function(widget, name) {
			var proto, name = "capriza." + name;
			if (!widget.base) {
				proto = _.extend(_.extend({}, widgetPrototype), widget);
				$.widget(name, proto);
			} else {
				proto = _.extend(_.extend({}, widgetPrototype), widget.proto);
				$.widget(name, widget.base, proto);
			}
		});

		// http://stackoverflow.com/questions/8320530/webkit-bug-with-hover-and-multiple-adjacent-sibling-selectors/8320736#8320736
		if (Capriza.device.stock) {
			$("<style>body {-webkit-animation: bugfix infinite 5s;}@-webkit-keyframes bugfix {from {padding:0;}to {padding:0;}}</style>").appendTo("head");
		}

	})(jQuery);

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/widgets/ActionableText.js

try{
	(function($) {
		var widgets = {
			longPress: {
				_init: function(){
					var self = this;
					if (!this.options.extraActions) return;
					if (!this.options.touchduration){
						this.options.touchduration = 500; //length of time we want the user to touch before we do something
					}
					this.element.addClass("long-press");//.addClass(this.options.type);
					if (!this.options.target){
						this.options.target = this.element;
					}
					this.showExtraActions = this.showExtraActions.bind(this);
					this.options.touchStart = this.touchStart.bind(this);
					this.options.touchEnd = this.touchEnd.bind(this);
					this.options.touchMove = this.touchMove.bind(this);
					this.options.target[0].addEventListener("touchmove", this.options.touchMove);
					this.options.target[0].addEventListener("touchend", this.options.touchEnd);
					this.options.target.parent().on("touchstart", this.parentTouchStart);
					this.options.target[0].addEventListener("touchforcechange", this.touchForceChange);
					this.options.target[0].addEventListener("touchstart", this.options.touchStart);
				},
				parentTouchStart: function(e){
					Logger.debug("longPress: parent click ignoring");
					e.stopPropagation();
					e.preventDefault();
				},
				touchForceChange: function(e){
					Logger.debug("longPress: hard touch changed");
					e.stopPropagation();
					if (!e.touches || !e.touches.length) return;
					if (e.touches[0].force > 0.2){
						e.preventDefault();
					}
					e.touches[0].force = 0;
				},
				touchStart: function(e){
					Logger.debug("longPress: touch start");
					e.stopPropagation();
					e.touches[0].force = 0;
					this.options.clientY = e.touches[0].clientY;
					this.options.longPressTimer && window.clearTimeout(this.options.longPressTimer);
					this.options.longPressTimer = window.setTimeout(this.showExtraActions, this.options.touchduration);
				},
				touchMove: function(e){
					e.touches[0].force = 0;
					var touchY =  e.touches[0].clientY;
					if (Math.abs(this.options.clientY - touchY) > 9){
						this.options.longPressTimer && window.clearTimeout(this.options.longPressTimer);
						this.options.longPressTimer = null;
					}
				},
				touchEnd: function(e){
					Logger.debug("longPress: touch end");
					e.stopImmediatePropagation();
					e.preventDefault();

					if (!this.options.longPressTimer) return;
					document.activeElement.blur();
					if (this.options.longPressTimer) {
						window.clearTimeout(this.options.longPressTimer);
						e.stopPropagation();
					}
					if (!$(".popup-opening").length){
						//} else {
						e.target.click();
					}
					//This is very ugly, for IOS WS a click event is trigger on the shield (which cause the context menu to close)
					setTimeout(function(){
						$(".popup-opening").removeClass("popup-opening");
					},61);
				},
				showExtraActions: function(){
					Logger.debug("longPress: showExtraActions called");
					this.options.target.addClass("popup-opening");
					this.options.longPressTimer && window.clearTimeout(this.options.longPressTimer);
					Utils.showContextMenu({items:this.options.extraActions, title: this.options.title});
				}
			},
			externalLink: {
				_init: function () {
					var self = this;
					if (!this.options.data) return;
					this.element.addClass("external-link");
					if (!this.options.target){
						this.options.target = this.element;
					}
					this.element[0].action = this.options.data;
					this.options.target.on("click", function(e) {
						self.openExternalLink(self.element[0].action);
					});
				},
				openExternalLink: function(url) {
					if (Capriza.cordova) {
						var openInBrowser = this.options.openInBrowser;
						if (openInBrowser) {
							this.openExternalApp(url);
						}
						else {
							var fileName = Utils.Links.extractFilename(url);
							Utils.Links.openExternal(url, fileName);
						}
					}
					else {
						this.openExternalApp(url);
					}
				},
				openExternalApp: function(url) {
					Utils.Links.openExternalApp(url);
				},
				setData: function(options){
					if (!options || !options.data) return;
					this.options.data = options.data;
					this.element[0].action = this.options.data;
				}
			},
			zappLink:{
				_init: function() {
					var self = this;
					if (!this.options.data) return;

					var workSimpleVersion = Capriza.cordova ? parseInt(Capriza.cordova) : -1;
					this.openInWorkSimple = workSimpleVersion >= 16;
					this.element.addClass("zapp-link");

					if (!this.options.target){
						this.options.target = this.element;
					}

					this.element[0].action = this.options.data;

					if (this.openInWorkSimple) {
						this.element[0].extraActions = [
							{ name: "Open in Browser", action: function() { self.openZappInBrowser(true); } },
							{ name: "Open in Work-Simple", action: function() { self.openZappInWorkSimple(); } },
						];
						if (document.queryCommandSupported("copy")){
							this.element[0].extraActions.push({ name: "Copy Link", action: function () { Utils.copyToClipBoard(self.options.data); } });
						}
						this.options.target.longPress({title: this.options.data, extraActions:this.element[0].extraActions});
					}

					this.options.target.on("click", function(e) {
						self.openZapp();
					});
				},
				openZapp: function () {
					if (this.openInWorkSimple) {
						this.openZappInWorkSimple();
					}
					else {
						var newTab = this.options.isZappInNewTab;
						this.openZappInBrowser(newTab);
					}
				},
				openZappInBrowser: function (newTab) {
					if (newTab) {
						Utils.Links.openExternalInBlank(this.element[0].action);
					}
					else {
						window.open(this.element[0].action, "_self");
					}
				},
				openZappInWorkSimple: function () {
					if (Capriza.device.ios) {
						Capriza.Capp.messenger.emit('runZapp', this.element[0].action);
					}
					else if (Capriza.device.android) {
						top.Capriza.zappAPI["runZapp"](this.element[0].action)
					}
					else {
						this.openZappInBrowser(true);
					}
				},
				setData: function(options){
					if (!options || !options.data) return;
					this.options.data = options.data;
					this.element[0].action = this.options.data;
				}
			},
			phone:{
				_init: function() {
					var self = this;
					if (!this.options.data) return;
					this.element.addClass("telephone");//.addClass(this.options.type);
					if (!this.options.target){
						this.options.target = this.element;
					}
					if (Capriza.device.ios){
						this.options.data = this.options.data.replace(/\s/g, "");
					}
					this.element[0].action = "tel:" + this.options.data;
					this.element[0].extraActions = [
						{name: "Call", action: function(){window.open( self.element[0].action, Utils.openAppString())}},
						{name: "Send SMS", action: function(){window.open("sms:"+ self.options.data, Utils.openAppString())}}
					];
					if (document.queryCommandSupported("copy")){
						this.element[0].extraActions.push({ name: "Copy Phone Number", action: function () { Utils.copyToClipBoard(self.options.data); } });
					}
					this.options.target.on("click", function(e) {
						e.stopPropagation();
						self.openPhone(self.element[0].action);
					});
					if(Capriza.device.isMobile) {
						this.options.target.longPress({
							title: this.options.data,
							extraActions: this.element[0].extraActions
						});
					}
				},
				openPhone: function(phone){
					window.open(phone, Utils.openAppString("_self"));
				},
				setData: function(options){
					if (!options || !options.data) return;
					this.options.data = options.data;
					if (Capriza.device.ios){
						this.options.data = this.options.data.replace(/\s/g, "");
					}
					this.element[0].action = "tel:" + this.options.data;
				}
			},
			email:{
				_init: function() {
					var self = this;
					this.element.addClass("email");//.addClass(this.options.type);
					if (this.options.data) {
						this.element[0].action = "mailto:" + this.options.data;
					}
					if (!this.options.target){
						this.options.target = this.element;
					}
					this.element[0].extraActions = [
						{ name: "New Email", action: function(){ self.openEmail(self.element[0].action) } },

					];
					if (document.queryCommandSupported("copy")){
						this.element[0].extraActions.push({ name: "Copy Email Address", action: function () { Utils.copyToClipBoard(self.options.data); } });
					}
					this.options.target.on("click", function(e) {
						e.stopPropagation();
						self.openEmail(self.element[0].action);
					});
					if(Capriza.device.isMobile) {
						this.options.target.longPress({
							title: this.options.data,
							extraActions: this.element[0].extraActions
						});
					}
				},
				openEmail: function(email){
					window.open(email, Utils.openAppString("_self"));
				},
				setData: function(options){
					if (!options || !options.data) return;
					this.options.data = options.data;
					this.element[0].action = "mailto:" + options.data;
				}
			},
			address:{
				_init: function() {
					var self = this;
					if (!this.options.data) return;
					this.element.addClass("address");//.addClass(this.options.type);
					this.openInMiniBrowser = this.openInMiniBrowser.bind(this);
					this.element[0].htmlEncodedValue = encodeURIComponent(this.options.data.replace(/[ ]?<[\/]?br\s*[\/]?>[ ]?/gi, " "));
					this.element[0].action = 'https://maps.google.com/maps?q=' + this.element[0].htmlEncodedValue;
					this.element[0].extraActions = [
						{name: "Open in Zapp", action: this.openInMiniBrowser}
					];
					if (Capriza.device.ios){
						this.element[0].extraActions.push({name: "Open in Maps", action: function(e){
							self.openMapsUrl("maps://?q="+ self.options.data);
						}});
					} else {
						this.element[0].extraActions.push({name: "Open in Maps", action: function(e){
							self.openMapsUrl('https://maps.google.com/maps?q=' + self.element[0].htmlEncodedValue);
						}});
					}
					if (Capriza.device.isMobile && (!Capriza.cordova || parseInt(Capriza.cordova) >= 16)) {
						if (Capriza.device.ios){
							this.element[0].extraActions.push({name: "Open in Google Maps", action: function(e){
								Utils.Links.openExternalApp('https://maps.google.com/maps?q=' + self.element[0].htmlEncodedValue);
							}});
						}
						this.element[0].extraActions.push({
							name: "Open in Waze", action: function (e) {
								Utils.Links.openExternalApp("waze://?q=" + self.element[0].htmlEncodedValue + "&navigate=yes", null, "https://itunes.apple.com/us/app/waze-social-gps-traffic/id323229106?mt=8", "https://play.google.com/store/apps/details?id=com.waze&referrer=utm_source%3Dgmm%26utm_campaign%3Dgmm_android" );

							}
						});
					}
					if (document.queryCommandSupported("copy")) {
						this.element[0].extraActions.push({ name: "Copy Address", action: function (e) { Utils.copyToClipBoard(self.options.data); }});
					}
					if (!this.options.target){
						this.options.target = this.element;
					}
					this.options.target.on("click", this.openInMiniBrowser);
					this.options.target.longPress({title: this.options.data, extraActions:this.element[0].extraActions});
				},
				openInMiniBrowser: function(e){
					e.stopPropagation();
					Capriza.Views.Utils.buildMiniBrowser(this.element[0].action + '&output=embed', this.getMiniBrowserExtraActions() );
				},
				getMiniBrowserExtraActions: function(){
					return this.element[0].extraActions.slice(1);
				},
				openMapsUrl: function(href){
					window.open(href, Utils.openAppString());
				},
				setData: function(options){
					if (!options || !options.data) return;
					this.options.data = options.data;
					this.element[0].htmlEncodedValue = encodeURIComponent(this.options.data.replace(/[ ]?<[\/]?br\s*[\/]?>[ ]?/gi, " "));
					this.element[0].action = 'https://maps.google.com/maps?q=' + this.element[0].htmlEncodedValue;
				}
			}
		};
		_.each(widgets, function(widget, name) {
			var proto, name = "capriza." + name;
			proto = _.extend(_.extend({}, Capriza.widgetPrototype), widget);
			$.widget(name, proto);
		});
	})(jQuery);

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/Page.js

try{
	(function() {
		Capriza.Model.Page = Backbone.Model.extend({
			initialize: function() {
//            Logger.debug("Capriza.Model.Page");
			}
			// placeholder
		});

		Capriza.Model.ContextPage = Capriza.Model.Page.extend({
			initialize: function() {
				var self = this;

				if (this.get("presentationControl")) {
					var root = new Capriza.Model.Control(this.get("presentationControl"));
					this.set("root", [root.get("id")]);
					root.addPage(self);
				}
				else if(this.get("controls")){
					this.set(
						"controls",
						this.get("controls").map(function(ctrl){
							var currModel = ctrl.id && Capriza.Model.Control.getById(ctrl.id);
							if(currModel && self.tableDrill) return currModel; // <-- already initialized (drill)page
							var model = new Capriza.Model.Control(ctrl);
							model.addPage(self);
							return model;
						})
					);
					this.set("root", [this.get("controls")[0].get("id")]);
				}

				Capriza.Model.Page.prototype.initialize.apply(this, arguments);

				this.verifyFirstContext();

				Capriza.Model.PageDB[this.getDbKey()] = this;

				this.on("change:controls", function() {
					var prevControls = self.previous("controls");
					prevControls && _.each(prevControls, function(control) {
						control && control.removePage(self);
					});

					var currControls = this.get("controls");
					currControls && _.each(currControls, function(control) {
						control && control.addPage(self);
					});
				});
			},

			getControlsOrRoot:function(){
				return (this.get("controls") || this.get("root"));
			},

			verifyFirstContext: function(){
				if (!Capriza.Model.firstContext) {
					logger.log('dispatching first context');
					Dispatcher.trigger("application/firstContext", {timeFromAccessURL: this.get('timeFromAccessURL')});
					Capriza.Model.firstContext = this;
				}
				else {
					logger.log('not dispatching first context');
				}
			},

			getDbKey: function() {
				return this.get("contextId");
			},

			controlChanged: function(control, attributes) {
				this.trigger("page/controlChanged", control, attributes );
				Dispatcher.trigger("page/controlChanged", this, control, attributes);
			},

			removeControl: function(controlId) {
				var index = this.get("root").indexOf(controlId);
				if (index > -1) this.get("root").splice(index, 1);
				this.trigger("page/controlRemoved", controlId);
			},

			containsControl: function(controlId) {
				function searchControl(controlModel) {
					if (found) return false;

					if (controlModel.get("id") === controlId) {
						found = true;
						return false;
					}

					var children = controlModel.get("controls");
					children && children.forEach(searchControl);
				}

				var found = false;
				if (!this.get("root") || !this.get("root").length) return;
				this.get("root").map(function(control) { return Capriza.Model.Control.getById(control); }).forEach(searchControl);
				return found;
			}
		},{
			getByContextId: function(contextId) {
				return Capriza.Model.PageDB[contextId];
			},

			compare: function(p1, p2) {
				if (!p1 && !p2) return true;
				if (!p1 || !p2) return false;
				if (p1.get("contextId") !== p2.get("contextId")) return false;

				var rootControlId1 = p1.get("root")[0];
				var rootControlId2 = p2.get("root")[0];

				var rootControl1 = Capriza.Model.Control.getById(rootControlId1);
				var rootControl2 = Capriza.Model.Control.getById(rootControlId2);
				var controls1 = rootControl1 && rootControl1.get("controls");
				var controls2 = rootControl2 && rootControl2.get("controls");

				if (!controls1 || !controls2 || controls1.length !== controls2.length) return false;

				var cache = [];

				var circularReplacer = function(key, value) {
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {
							// Circular reference found, discard key
							return;
						}
						// Store value in our collection
						cache.push(value);
					}
					return value;
				};

				var controls1Str = JSON.stringify(controls1, circularReplacer);
				cache = [];
				var controls2Str = JSON.stringify(controls2, circularReplacer);
				cache = null; // Enable garbage collection

				return controls1Str === controls2Str;
			}
		});

		Capriza.Model.LoginPage = Capriza.Model.ContextPage.extend({

			verifyFirstContext: function(){
				//prevent splash hiding by overriding default.
			},

			verifyLoginAsFirstContext: function(){
				Capriza.Model.ContextPage.prototype.verifyFirstContext.apply(this);
			},

			initialize: function() {
				this._identityKeysToModel = {};

				Capriza.Model.ContextPage.prototype.initialize.apply(this, arguments);

				var controls = this.get("root").map(function(controlId){
					return Capriza.Model.Control.getById(controlId);
				});
				this._storeIdentityKeys(controls);
			},

			_storeIdentityKeys: function(controls){
				var self = this;
				if (controls) {
					_.each(controls, function(control) {
						if(control && control.get("identityKey")){
							self._identityKeysToModel[control.get("identityKey")] = control.get("id");
						}
						control && self._storeIdentityKeys(control.get("controls"));
					});
				}
			},

			getModelForIK:function(ik){
				return ik && this._identityKeysToModel[ik] && Capriza.Model.Control.getById(this._identityKeysToModel[ik]);
			},

			getIdentityKeys:function(){
				return Object.keys(this._identityKeysToModel);
			}

		});

		Capriza.Model.MVPage = Capriza.Model.BlueprintPage = Capriza.Model.ContextPage.extend({

			verifyFirstContext: function(){
				//This is to prevent false reports on first visible page...
			}

		});

		Capriza.Model.PageDB = {};
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/HandlebarsUiControl.js

try{
	/**
	 * Created with JetBrains WebStorm.
	 * User: oriharel
	 * Date: 11/28/12
	 * Time: 1:22 PM
	 * To change this template use File | Settings | File Templates.
	 */
	;(function() {
		Capriza.Views.HandlebarsUiControl = Capriza.Views.UiControl.extend({
			_render: function() {
				return this._renderHendelbars();
			},

			_addMaxLengthValidation: function($elm){
				if ($elm && this.model.get("maxLength")) {
					$elm.attr("maxlength",this.model.get("maxLength"));
					if (Capriza.device.isMobile && Capriza.device.android){
						$elm.on("change keyup", function(event){
							var maxLength = $(this).attr("maxlength");
							if (this.value.length > maxLength){
								//remove extra text which is more then maxLength
								$(this).val($(this).val().slice(0, maxLength));
							}
						});
					}
				}
			}
		});
	})();


}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};