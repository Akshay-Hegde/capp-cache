

//! Source: javascripts/new/views/Content.js

try{
	;
	(function () {

		Capriza.Views.Content = Capriza.Views.UiControl.extend({

			initialize: function() {
				_.extend(
					this.model,
					{
						getCurrentItemsForCache : function(){
							return [{text:this.get("value")}];
						}
					}
				);
			},

			_render: function () {
				this.$el.addClass("content").attr("id", this.getUniqueControlId());

				if (this.model.get('videoData')) {
					this.$el.addClass('content-video');
					this.setVideoData(this.model.get('videoData'));
				}
				else {
					this.$value = $('<div class="value styleable-text" />').appendTo(this.$el);
					var value = this.parseValue();
					this.setValue(value.replace(/&quot;/g, "'"));
				}
				//var self = this;
				//function increase(){
				//    //self.$el.height(self.$el.height() + 300);
				//    self.moveAllNextElementDown(self.$el, 300, "300ms", true);
				//    todo = decrease;
				//}
				//function decrease(){
				//    //self.$el.height(self.$el.height() - 300);
				//    self.moveAllNextElementUp(self.$el, 300 , "300ms", true);
				//    todo = increase;
				//}
				//var todo = increase;
				//this.$el.on("click", function(){
				//    //todo();
				//});
				return this.$el;
			},

			labelFor: Utils.noop,

			parseValue : function() {
				var value = this.model.get("value") || "";
				return value.replace("{APP-NAME}", Utils.getAppName);
			},

			setVideoData : function (videoData) {

				if(typeof this.model.get('videoData') !== "object"){
					return;
				}
//          normalize
				videoData.width="90%";
//          delete videoData.height;

				this.$el.html($("<iframe>",videoData));
			},

			setValue: function (value) {
				if((typeof value == "string") && (value.indexOf("{APP-NAME}") > -1 )) {
					value = value.replace("{APP-NAME}", Utils.getAppName);
				}

				this._insertHtml(value);

				if (this.model.get("shouldUseWebColor")) {
					var style = this.model.get("style");
					style && (this.$el.css(style) && this.$value.css(style));
				}

				//we need to make sure that mcStyle will override the value
				this.setMcStyle();

			},

			setCss: function (el, name, value) {
				if (name === "font-size") {
					el.css(name, value);
					el.css("line-height", "1em");
				} else {
					Capriza.Views.UiControl.prototype.setCss.apply(this, arguments);
				}
			},

			_insertHtml: function(html) {
				var contentAction= this.model.get('contentAction');
				this.$value.html(Capriza.Views.Utils.addTelephoneLinks(html || "", contentAction));

				if (contentAction === "openFeedback"){
					this.$el.addClass("open-feedback");
					this.$value.on("click", Utils.openFeedback);
					return;
				}
				// if outside of native iOS Capriza, use iframe to open external links
				Capriza.Views.Utils.createMiniBrowser(this.$el, this.model);
			}

		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Group.js

try{
	;(function() {
		Capriza.Views.Group = Capriza.Views.UiControl.extend({
			initialize: function() {
				var self = this;
				this.options.getViewByModel = this.options.getViewByModel || this.getViewByModel;
				_.each(this.model.get("controls"), function(control) {
					self.createAndAddControl(control);
				});

				this.model.off("change:controls").on("change:controls",function(){
					self.options.page.getViews(self.model.previousAttributes()["controls"] || []).forEach(function(view){
						view.destroy();
					});
				});
				this.$innerContainer = this.initInnerContainer();

				this.addClickAction();

			},

			addClickAction: function(){
				var clickAction = this.model.get("click");
				if (!clickAction) return;

				Logger.debug("[ClickAction] creating click action view ("+clickAction.get("id")+")" + "for control: " + this.model.get("id"));

				var clickActionView = this.getView(clickAction); //to handle updates (on the view) from the Engine
				clickActionView.parentView = this; //bind the clickActionView to this view.
				this.options.page.addView(clickAction.get("id"), clickActionView);
			},

			createAndAddControl: function(control){
				if(control.get("missing")) return;
				var view = this.getView(control);
				this.options.page.addView(control.get("id"), view);
				return view;
			},

			getView: function(model) {
				return Capriza.Views.createView(model, this.options.page, _.bind(this.options.getViewByModel, this), this.defaultView);
			},

			getViewByModel: function(model) {

				var type = model.get('type'), key = model.get('key');

				var typeClass = this.modelToView && this.modelToView[type];
				if (typeClass) return typeClass;

				if (Capriza.Views.modelToView[type]) return Capriza.Views.modelToView[type];

				if (model.get("controls")) {
					return Capriza.Views.GenericCollection;
				} else {
					return Capriza.Views.GenericView;
				}
			},

			initInnerContainer: function() {
				return this.$el;
			},

			modelToView: Capriza.Views.modelToView,

			_render: function() {
				_.each(this.model.get("controls"), this.addControl, this);
				this.renderedCount = this.model.get("controls") && this.model.get("controls").length;

				this.addPaginator();

				this.$el.addClass("group").attr("id", this.getUniqueControlId() || "");

				if (this.model.get('mcClass') === 'vertical-layout') {
					this.$el.removeClass('horizontal-layout');
				}

				if (Capriza.isRTL) {
					this.$el.addClass('right-align');
				}
				return this.$el;
			},

			_post: function(){
				if (this.model.get("click")){
					var clickActionView = this.options.page.getView(this.model.get("click").get("id"));
					clickActionView.render();
				}
			},

			addControl: function(control) {
//            Logger.debug('adding control of type '+control.get("type")+' and id '+control.get("id"));
				if(control.get("missing")) return;
				var view = this.options.page.getView(control.get("id"));
				this.$el.append(view.render());
			},

			processSelectableGroupItem: function(control, groupItemElement, groupItemUniqueControlId, parentId) {
				var self = this,
				    $el = $(groupItemElement);

				var inputType = 'radio';
				if (control.get('supportsMulti') && control.get('supportsUnselect')) {
					inputType = 'checkbox';
				}

				var selectEl = $("<div id='" + groupItemUniqueControlId + "Checkbox' class='selectable-checkbox'> <i class='selected-icon icon-checkbox-selected'></i> <i class='unselected-icon icon-checkbox-unselected'></i> </div>").addClass(inputType + "-selection-mode").prependTo($el);

				if (control.get("actionControls") && control.get("actionControls").indexOf("selectDisabled") > -1) selectEl.addClass("disabled");
				if (control.get("isDisabled")) selectEl.addClass("disabled");
				if (!Capriza.device.stock) {
					$.capriza.fastClick($(selectEl)[0]);
				}

				selectEl.toggleClass('checked', !!(control.get('isSelected') || control.get('selected')));
				$el.toggleClass('selected', !!(control.get('isSelected') || control.get('selected')));

				selectEl.on("click", function() {
					if (selectEl.hasClass("disabled")) return;
					var isChecked = $(this).hasClass('checked');
					if(inputType === 'checkbox' || (inputType === "radio" && !isChecked)) {
						Dispatcher.trigger("select/change", {checked: !isChecked, id: this.id, parent: self});

						control.api.setIsSelected(!isChecked);
						control.set("isSelected", !isChecked);
					}
					return false;
				});

				Dispatcher.on("select/change", function(data){
					if (selectEl[0].id === data.id) {
						selectEl.toggleClass('checked', !!data.checked);
						$el.toggleClass('selected', !!data.checked);
					} else if (inputType === 'radio' && data.parent === self) {
						selectEl.removeClass('checked');
						$el.removeClass('selected');
					}
				});
			},

			prependEl: function ($view) {
				this.$el.prepend($view);
			},
			addViewAtIndex: function(view, index) {
				function animateIn() {
					$view.addClass("animated fadeInLeft");
					$view.on("animationend webkitAnimationEnd", function() {
						$view.removeClass("animated fadeInLeft");
						Dispatcher.trigger("view/animateIn/after", view);
					});
				}

				var $view = view.render();
				// if there is no index, or if this view should be the last item append it
				if (index === undefined) {
					this.$el.append($view);
				} else if (index === 0) {
					this.prependEl($view)
				} else {
					//get prevControl from the DOM
					var indexOfModel = 0,
					    controls = this.model.get("controls");
					for (var i = 0; controls && (i < controls.length); i++){
						if (controls[i].get("id") == view.model.get("id")) {
							indexOfModel = i;
						}
					}
					var found;
					while (indexOfModel > 0){
						var beforeModel = this.model.get("controls")[--indexOfModel];
						if (!beforeModel) return;
						var beforeView = this.options.page.getView(beforeModel.get("id"));
						if (beforeView && !beforeView.model.get("missing")) {
							$view.insertAfter(beforeView.$el);
							found = true;
							break;
						}
					}
					!found && this.prependEl($view);
				}
				Dispatcher.trigger("view/animateIn/before", view);

				if(window.isDesignerPreview || window.designerLoaded) {
					Capriza.Views.usePageUpdateAnimation && animateIn();
				}

			},

			addPaginator: function() {
				function createPaginator(type, options) {
					options || (options = {});
					var eventType, icon;
					if (type === "Next") {
						eventType = "next";
						icon = "fa-chevron-right";
					} else {
						eventType = "previous";
						icon = "fa-chevron-left";
					}
					return $("<button><i class='fa " + icon + "'></i></button>").paginatorButton({ type: eventType, disabled: options.disabled }).on("paginatorbutton_click", paginatorClicked(eventType)).appendTo(buttonsGroup);
				}

				function paginatorClicked(type) {
					return function() {
						createGroupPaginator();
						$.capriza.groupPaginator.lastClicked = type;
						self.model.api[type]();
					};
				}

				function createPagesList(items) {
					if (!items || items.length == 0) return;
					var pages = $("<select><option>page</option></select>").css({width: "50%"}).appendTo(itemsCount);
					items.forEach(function(option) {
						pages.append($("<option></option>").val(option).text(option));
					});

					pages.on("change", function() {
						if (this.selectedIndex === 0) return;
						self.model.api.setPage( self.model.get("pages")[this.selectedIndex - 1] ); // Since we added default page option as 1st element index decreased by 1
					});

					return pages;
				}

				function createGroupPaginator(){
					if (!$.capriza.groupPaginator){
						$.capriza.groupPaginator = {};
					}
				}

				function createNumberOfItems(controls, isLast, isFirst){
					createGroupPaginator();
					var totalCount = $.capriza.groupPaginator.totalCount,
					    currentControls = controls.length > 1 ? (controls[1].get("type").indexOf("drill") > -1 ? controls.length/2 - 1 : controls.length - 1) : 1,
					    startIndex ,endIndex, sameAsBefore;
					if ($.capriza.groupPaginator.lastClicked == "previous"){
						startIndex = $.capriza.groupPaginator.startIndex - currentControls;
						startIndex--;
						if (startIndex < 1 ){
							startIndex = 1;
						}
					} else if ($.capriza.groupPaginator.lastClicked == "next"){
						if  ((window.isDesignerPreview || window.designerLoaded) && !Capriza.designerMode || isFirst){
							startIndex = 1;
						} else {
							startIndex = $.capriza.groupPaginator.endIndex || 0;
							startIndex++;
						}
					} else {
						sameAsBefore = true;
					}
					$.capriza.groupPaginator.lastClicked = "";
					if (sameAsBefore){
						startIndex = $.capriza.groupPaginator.startIndex || 1;
						endIndex = $.capriza.groupPaginator.endIndex || (startIndex + currentControls);
					} else {
						endIndex = startIndex + currentControls;
					}
					$.capriza.groupPaginator.startIndex = startIndex;
					$.capriza.groupPaginator.endIndex = endIndex;
					if (isLast || ($.capriza.groupPaginator.totalCount && $.capriza.groupPaginator.totalCount < endIndex)) {
						$.capriza.groupPaginator.totalCount = totalCount = endIndex;
					}

					$("<span>"+startIndex+"-"+endIndex+"</span>").addClass("paginator-items-numbers").appendTo(itemsCount);
					itemsCount.append(" of "+ (totalCount ? "" : "many"));
					$("<span>"+(totalCount ? totalCount : "")+"</span>").addClass("paginator-items-numbers total-items").appendTo(itemsCount);

				}

				this.paginator && this.paginator.remove();
				var controls = this.model.get("controls");
				if ((!this.model.get("hasPrevious") && !this.model.get("hasNext") && !this.model.get("pages")) || !controls  || !controls.length) return;

				var self = this, group = $("<div></div>").addClass("paginator " + self.getUniqueControlId()).appendTo(self.$el);
				if (!self.model.get("hasPrevious") && !self.model.get("hasNext")) {
					// only pages list
					createPagesList(self.model.get("pages"));
					group.prepend($("<span></span>").text("Page:"));
					group.addClass("only-pages");
					return;
				}

				var buttonsGroup = $("<div></div>").addClass("paginator-buttons").appendTo(group);

				createPaginator("Previous", { disabled: !self.model.get("hasPrevious") });
				createPaginator("Next", { disabled: !self.model.get("hasNext") || self.model.get("yesMore") });
				var itemsCount = $("<div></div>").addClass("paginator-items-count").appendTo(group),
				    items = self.model.get("pages");
				if (items && items.length == 0) {
					createPagesList(items);
				} else {
					if (controls.length > 0 && controls[0].get("mcTemplId")) {
						createNumberOfItems(controls, !self.model.get("hasNext"), !self.model.get("hasPrevious"));
					}
				}
				self.paginator = group;
			},

			setPresentedControlCount: function() {
				var self = this;
				if (this.model.get("presentedControlCount")) {
					var msg = 'Showing first ' + self.model.get("presentedControlCount") + ' items';
					if (self.$presentedControlCount) {
						self.$presentedControlCount.text(msg);
					} else {
						self.$presentedControlCount = $('<div class="' + self.getUniqueControlId() + '_showingMessage presented-count">' + msg + '</div>').appendTo(self.$el);
					}
				} else if (self.$presentedControlCount) {
					self.$presentedControlCount.remove();
					self.$presentedControlCount = null;
				}
			},

			setControls: function() {
				if (this.updating) return;
				var currScrollPosition = $.capriza.currentScrollPosition();
				this.$el.empty();
				this.$label = null;
				this.$presentedControlCount = this.$showMorebtn = this.$showMoreSpinner = null;
				this.updating = true;
//            Capriza.Model.Control.prototype.initialize.call(this.model, this.model.attributes, { parent: this.model.parent });
//            this.model.addPage(this.model.pages);
				this.initialize();
				this.updating = false;
				this.render();
				//this.setIsLast(this.isLast); // (AMIT) a hack :-( setIsLast has functionality that should be inside _render(), but I can't remember why it wasn't there in the first place
				$.capriza.activePage[0].scrollTop = currScrollPosition;
			},

			setPaginator: function() {
				$(".paginator", this.$el).remove();
				this.addPaginator();
			},

			setPages: function(pages) {
				this.setPaginator();
			},

			setHasNext: function(hasNext) {
				this.setPaginator();
			},

			setHasPrevious: function(hasPrevious) {
				this.setPaginator();
			},

			addShowMore: function() {
				if (!this.$showMoreSpinner || !this.$showMoreSpinner.length) {
					this.$showMoreSpinner = $("<div class='show-more-spinner'></div>").rotatingSpinner({
						width: "35px",
						height: "35px"
					}).appendTo(this.$el);
				}
			},

			renderChunk: function(startIndex) {
				var self = this;
				var newControls = self.model.get("controls").slice(startIndex);
				_.each(newControls, function(control, i) {
					self.options.page.addView(control.get("id"), self.getView(control));
					self.addControl(control, startIndex+i);
				});
				self.renderedCount += newControls.length;

				self.setMcStyle();
			},

			setMoreItems: function(response){
				Logger.debug('handling moreItems');
				var control = this.model;
				var controls = response.controls.map(function (c) {
					var model = new Capriza.Model.Control(c, { parent: control});
					model.addPage(control.pages);
					return model;
				});
				control.attributes.controls = control.attributes.controls.concat(controls);
				control.set("yesMore", response.yesMore);
				_.each(control.pages, function(page) {
					page.trigger("page/moreItems", control, response.startIndex);
				});
			},

			onMoreItemsArrived: function(startIndex) {
				if (!this.waitingForItems) return;
				if (!this.model.get("yesMore")){
					this.$showMoreSpinner && this.$showMoreSpinner.removeClass("active");
					this.$(".spinner").removeClass("active");
				}
				this.waitingForItems = false;
				if (this.model.get("yesMore")) {
					if (this.isLast) {
						this.scrollDetector.start();
					} else {
						this.$showMorebtn.addClass("active");
						this.$showMoreSpinner && this.$showMoreSpinner.removeClass("active");
						this.$(".spinner").removeClass("active");
					}
				} else {
					this.paginator && this.setHasNext(this.model.get("hasNext"));
				}
				this.renderChunk(startIndex);
			},

			setYesMore: function(isYesMore) {
				var self = this;
				if (isYesMore && !this.options.page.isMvp && Capriza.StateManager.isSynced) {
					if (this.isLast) {
						self.scrollDetector = (self.scrollDetector || new Capriza.Views.ScrollDetector({ el : self.el }).on("change", function() {
							if (self.options.page.$el.hasClass('active')){
								self.scrollDetector.stop();
								self.waitingForItems = true;
								self.model.api.getMoreItems(self.renderedCount);
							} else {
								self.$showMoreSpinner && self.$showMoreSpinner.removeClass("active");
							}
						}));


						self.$showMoreSpinner.addClass("active");

						if (!self.waitingForItems) {
							setTimeout(function() {
								// verify before the call to the API that waitingForItems wasn't changed between the
								// last check and the actual time that the callee method is run in the timeout
								if(self.waitingForItems) return;
								// if the last item is visible in the viewport, then need to ask for more items without scroll
								Logger.debug('getting last control id is '+self.model.get("controls")[self.model.get("controls").length - 1].get("id")+' type is '+self.model.get("controls")[self.model.get("controls").length - 1].get("type"));
								var topLevelControls = self.getTopLevelControls();

								function activateScroll(){
									if (topLevelControls.length > 0) {
										var controlsLen = topLevelControls.length;
										var lastControl = topLevelControls[controlsLen - 1].get('controls')[0];
										var pageBottom = self.options.page.$el[0].getBoundingClientRect().bottom;
										var lastControlView = self.options.page.getView(lastControl.get("id"));
										var lastControlTop = lastControlView ? lastControlView.$el[0].getBoundingClientRect().top : 0;

										Logger.debug("page bottom " + pageBottom + " <==> last item top " + lastControlTop);
										//IF control is not in DOM (as in first phase in tables) then lastControlTop is 0 and we don't want more items
										if (lastControlTop > 0 && pageBottom >= lastControlTop) {
											self.$showMoreSpinner.addClass("active");
											self.waitingForItems = true;
											self.model.api.getMoreItems(self.renderedCount);
										} else {
											self.scrollDetector.start();
										}
									}
								}
								self.options.page.$el.one("page/disabled", function(){
									self.$showMoreSpinner && self.$showMoreSpinner.removeClass("active");
								});
								if (self.options.page.$el.hasClass('active')){
									activateScroll();
								} else {
									self.options.page.$el.one("page/active", function(){
										activateScroll();
									});
								}
							}, 0);
						}
					} else {
						self.scrollDetector && self.scrollDetector.stop();
						self.$showMorebtn = (self.$showMorebtn || $("<button class='show-more'>Show More</button>").on("click", function() {
							self.waitingForItems = true;
							self.$showMoreSpinner.addClass("active");
							self.$showMorebtn.removeClass("active");
							Logger.debug('getting more items with '+self.renderedCount);
							self.model.api.getMoreItems(self.renderedCount);
							return false;
						}).appendTo(self.$el));

						if (!self.waitingForItems) self.$showMorebtn.addClass("active");
					}
				} else {
					self.scrollDetector && self.scrollDetector.stop();
					self.$showMorebtn && self.$showMorebtn.removeClass("active");
					self.$showMoreSpinner && self.$showMoreSpinner.removeClass("active");
				}
			},

			getTopLevelControls: function() {
				return this.model.get('controls');
			},

			setIsLast: function(isLast) {
				var self = this;
				self.isLast = isLast;
				self.addShowMore();
				self.setYesMore(self.model.get("yesMore"));
			},

			_destroy: function() {

				this.model.get("controls") && this.options.page.getViews(this.model.get("controls")).forEach(function(view){
					view.destroy();
				});

				if (this.scrollDetector) {
					this.scrollDetector.stop();
				}
			}
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Table.js

try{
	;(function() {

		var testElement = document.createElement('div');

		var transformPrefix = "transform" in testElement.style ? "transform" : "webkitTransform";
		var transformProperty = transformPrefix === "webkitTransform" ? "-webkit-transform" : "transform";

		Capriza.Views.disableScroll = function(e) {
			if (event.touches.length === 1) {
				$(this).off('touchmove' ).on('touchmove', function(e) {

					event.preventDefault();
					event.stopPropagation();
				});
			}
		};

		Capriza.Views.registerDisableScroll = function() {

			$(window).on('touchstart', Capriza.Views.disableScroll);

		};

		Capriza.Views.unregisterDisableScroll = function() {
			$(window).off('touchstart', Capriza.Views.disableScroll);
			$(window).off('touchmove');
		};

		// Simulates click when user presses Space or Enter
		function onKeyPress(event) {
			if ((event.which == 13) || (event.which == 32)) {
				this.click();
			}
			return false;
		}

		Capriza.Views.TableRow2 = Capriza.Views.Group.extend({
			template: "tableRow",
			initialize: function() {
				Capriza.Views.Group.prototype.initialize.apply(this, arguments);
				this.table = this.options.table;
				this.page = this.options.page;

				var shouldUseWebColor = this.table.model.get("shouldUseWebColor");
				this.model.attributes["shouldUseWebColor"] = shouldUseWebColor;
				this.getMainControl().attributes["shouldUseWebColor"] = shouldUseWebColor;
				_.each(this.getMainControl().get("controls"), function(control) {
					control.attributes["shouldUseWebColor"] = shouldUseWebColor;
					var controls = control.get("controls");
					controls && controls.forEach(arguments.callee);
				});

			},

			//initInnerContainer: function() {
			//    return $(".row-box", this.$el);
			//},

			_render: function() {
				this._renderHendelbars();
				this.$innerContainer =$(".row-box", this.$el);



				// var shouldUseWebColor = this.table.model.get("shouldUseWebColor");
				//Main Control
				var mainControl = this.getMainControl();
				var mainView = this.page.getView(mainControl.get("id"));
				mainView.render().addClass("main-control").appendTo(this.$innerContainer);
				mainView.rowIndex = this.rowIndex;

				//Aligned column
				if (this.table.model.get("alignedColumn") !== undefined) {
					mainView.$el.find(">.grouping>.ui-control").eq(this.table.model.get("alignedColumn")).appendTo(this.$innerContainer).addClass("hide-labels aligned-column");
				}

				//Group Selector
				if(this.table.isTableHasSelectable(this.model)){
					this.table.processSelectableGroupItem(this.getSelectControl(), this.getRepEl(), this.getUniqueControlId());
				}

				//Drill
				if (this.table.isTableHasDrillPage()) {
					this.addDrill();
				}


				//Swipe
				var swipeActions = this.getSwipeActions();

				if (swipeActions) {
					this.addSwipe(swipeActions);
				} else if(this.table.isTableHasSwipeActions() && !this.table.model.get('hasDrillPage')) {
					this.getRepEl().append('<div class="swipe-icon-placeholder"></div>');
				}

				return this.$el;
			},

			getRepEl:function(){
				return $(".row-box",this.$el).first();
			},

			setShouldUseWebColor: function() {

				Capriza.Views.UiControl.prototype.setShouldUseWebColor.apply(this, arguments);
				var style = this.model.get("style");
				style && this.getRepEl().css(style);
			},

			getMainControl: function() {
				var mainControl = this.model.get('controls').filter(function(control) {
					return control.get('type') === 'main';
				});
				return mainControl[0];
			},

			getSelectControl: function() {
				var selectControl = this.model.get('controls').filter(function(control){
					return control.get('type') === 'groupSelector';
				});
				return selectControl[0];
			},

			getSwipeActions: function() {
				var swipeActionsSections =  this.model.get('controls').filter(function(control) {
					return control.get('type') === 'swipeActions' && control.get('controls') && control.get('controls').length > 0;
				});
				return swipeActionsSections && swipeActionsSections[0];
			},



			//TODO: Refactor this abit...
			addDrill:function(){
				var self = this, $item = this.getRepEl(), row = this.getMainControl(), rowId = row.get("id");
				$item.addClass("drill");
				var $drillIcon = $("<div class='drill-icon'></div>").appendTo(this.getRepEl());

				if(!this.table.isTableHasDrillPageControls()){ //table actually does not have the drill pages (we are in the middle of phases).
					$drillIcon.addClass("missing-drill");
					return;
				}

				if (Capriza.device.isDesktop) {
					$drillIcon.attr("tabindex", 0).keypress(onKeyPress);
				}
				this.fastclick = $.capriza.fastClick($item[0], { highlightDelay: 100 });

				// This just looks like a hack, but actually all the stop propagation in TableEx should be written in a more simple way here, just like it is in tabular.
				$(".onoffswitch", $item).on("click", function(e) { e.stopPropagation(); });
				$(".onoffswitch3", $item).on("click", function(e) { e.stopPropagation(); });

				$item.on("click", function(e) {
					if(self.$el.hasClass("clickable") && !e.target.classList.contains("drill-icon")) return;

					e.stopPropagation();
					if ($(this).hasClass('swiping') || $(this).hasClass('swipped')) return;
					if ($(this).hasClass('swipe-shown')) {
						self.hideSwipeActions(self.getRepEl($(this)));
						return;
					}
					if (!$(".viewport").hasClass("transitioning") && !self.table.$el.hasClass('phantom')) {
						var $liItem = self.$el;
						$liItem.addClass('clicked');
						setTimeout(function(){
							$liItem.removeClass('clicked');
						}, 0);

						var transition = Capriza.device.isTablet ? "none" : "slide";
						self.closeAllOtherSwipes();
						self.table.doDrill(rowId, {transition: transition});
						try{
							self.reportInteraction({
								element: "Table",
								interaction: "click",
								controlPath: "#" + self.model.get("id") + " [data-mc='"+rowId+"'] + div",
								rowId: rowId,
								rowIndex: self.drillIndex
							});
						} catch(e){
							Logger.info("[UserInteraction] Exception on report Table do drill interaction");
						}
					}
				});

			},

			hideSwipeActions: function(swipeContainer) {
				var self = this;
				$(swipeContainer).addClass('swiping');
				var cssObj = {};
				cssObj[transformProperty] = "translate3d(0, 0, 0)";

				document.removeEventListener("click", self.closeAllForThis, {passive: true});
				$(swipeContainer).transition(cssObj, function(){
					$(this).css(transformProperty, '0, 0, 0');
					$(this).removeClass('swiping');
					$(this).removeClass('swipe-shown');
					var numOfOpenSwipes = $('.swipped', self.$el).length;//TODO: copied a bug...the this of this function is not the table
					if (Capriza.device.stock && numOfOpenSwipes === 0) {
						Capriza.Views.unregisterDisableScroll();
					}
					if(!$(swipeContainer).hasClass('swipingOn')) {
						var $row = $(swipeContainer).parent();

						$(".swipe_cell", $row).removeClass("show-swipe-actions");
					}
					self.trigger("swipe/end");
				});
			},

			showSwipeActions: function(swipeContainer) {
				var self = this;
				$(swipeContainer).addClass('swiping').addClass('swipingOn');
				self.closeAllForThis = self.closeAllOtherSwipes.bind(self);
				document.addEventListener("click", self.closeAllForThis, {passive: true});

				self.closeAllForThis(self.$innerContainer);

				var $row = $(swipeContainer).parent();

				var $cell = $(".swipe_cell", $row);
				if ($cell.length > 0) Logger.debug("[Table][showSwipeActions] add class 'show-swipe-actions' to: " + $cell[0].outerHTML);
				else Logger.debug("[Table][showSwipeActions] didn't find the swipe_cell, $row: " + $row[0].outerHTML);

				$cell.addClass("show-swipe-actions");

				var cssObj = {};
				cssObj[transformProperty] = "translate3d(-72%, 0, 0)";
				$(swipeContainer).transition(cssObj, function(){
					$(this).removeClass('swiping').removeClass('swipingOn');
					$(this).addClass('swipe-shown');
					if (Capriza.device.stock) {
						Capriza.Views.registerDisableScroll();
					}
					self.trigger("swipe/end");
				});
			},

			initSwipeForItem: function($item, $itemContent, $swipeIcon, isMobile, onStartCallback) {
				if (isMobile) {
					$item.swipe({swipeRight: _.bind(this.showSwipeActions, this), swipeRightArgs: [$itemContent],
						swipeLeft: _.bind(this.hideSwipeActions, this), swipeLeftArgs: [$itemContent], onStart: onStartCallback });
				}
				else {
					$item.mouseSwipe({swipeRight: _.bind(this.showSwipeActions, this), swipeRightArgs: [$itemContent],
						swipeLeft: _.bind(this.hideSwipeActions, this), swipeLeftArgs: [$itemContent], onStart: onStartCallback });
				}
			},

			closeAllOtherSwipes: function($itemContent) {
				var openSwipes = $('.swiping, .swipe-shown');
				if (!$itemContent && openSwipes.length > 0) {
					//basically, close all swipes
					this.hideSwipeActions(openSwipes);
				}
				else {
					var self = this;
					//close all other swipes
					openSwipes.each(function() {
						if (this != $itemContent[0]) {
							self.hideSwipeActions($(this));
						}
					})
				}
			},

			onDragTableCancel: function(xMoved, $el, step) {
				$el.addClass('swiping');

				if (step.direction === 'left') {
					this.hideSwipeActions($el[0]);
				}
				else {
					this.showSwipeActions($el[0]);
				}

			},

			//TODO: Refactor this abit...
			addSwipe: function(swipeActions) {
				var $item = this.$el;
				var $swipeIcon;

				$item.addClass("swipe");


				if (!this.table.model.get('hasDrillPage')) {
					$swipeIcon = $("<div class='swipe-icon'/>");
					$swipeIcon.html("<i class='fa fa-ellipsis-v'/>");

					if (Capriza.device.isDesktop) {
						$swipeIcon.attr("tabindex", -1);
					}
					this.getRepEl().append($swipeIcon);
				}

				var swipeContainerView = this.options.page.getView(swipeActions.get('id'));
				if (!swipeContainerView) {
					Logger.error('ERROR! swipeContainerView '+swipeActions.get('id')+' is undefined');
				}
				var $swipeContainer = swipeContainerView.render();

				$("button", $swipeContainer).attr("tabindex", -1);
				$swipeContainer.addClass('swipe_cell');
				var self = this;

				var $itemContent = this.getRepEl();

				$swipeIcon = $('.swipe-icon', $itemContent);

				$swipeIcon.off('click').on('click', function(e) {
					e.stopPropagation();
					setTimeout(function(){
						$swipeIcon.removeClass('clicked');
					}, 0);

					if ($(this).parent(".swipe-shown").length > 0) {
						self.hideSwipeActions($itemContent);
					}
					else {
						self.closeAllOtherSwipes();
						self.showSwipeActions($itemContent);
					}

				});

				if (Capriza.device.isMobile && (Capriza.device.chrome || Capriza.device.ios)) {
					//strange, but this line of code solves #9306
					if (Capriza.device.ios) this.options.page.$el.on('touchstart', function() {});

					var itemWidth, thirdItemWidth, itemLeft;

					var dragCallback = function(step, transformProperty) {
						if ($itemContent.hasClass('swiping') || ($itemContent.hasClass('swipe-shown') && step.direction === 'left')) {
							step.toSet = undefined;
							return;
						}
						var toX = step.toSet;
						if ($itemContent[0].getBoundingClientRect().right+toX <= itemWidth &&
							$itemContent[0].getBoundingClientRect().right >= (thirdItemWidth-10)) {

							$itemContent[0].style[transformProperty] = 'translate3d('+toX+'px, 0, 0)';

							try{
								var controlPath = "#" + self.model.get("id") + " [data-mc='"+rowControlId+"'] + .swipe-icon";
								if ($(controlPath).length) {
									self.reportInteraction({
										element: "Table",
										interaction: "click",
										controlPath: controlPath,
										rowId: rowControlId,
										rowIndex: self.drillIndex,
										additionalData: "swipe perform"
									});
								}
							} catch(e){
								Logger.info("[UserInteraction] Exception on report Table do drill interaction");
							}
						}
					};

					var onStart = function(step) {

						if (step.direction === 'left') {
							self.closeAllOtherSwipes($itemContent);
						}

						$swipeContainer.addClass("show-swipe-actions");
						//$itemContent[0].style[transformProperty] = 'translate3d(0, 0, 0)';
						thirdItemWidth = $item.width()*0.3;
						itemWidth = $item.width();
						itemLeft = $item[0].getBoundingClientRect().left;
					};

					$itemContent.drag({swipeRight : _.bind(this.showSwipeActions, this),
						swipeLeft : _.bind(this.hideSwipeActions, this),
						threshold: 0.25,
						dragCallback: dragCallback,
						onCancel: _.bind(this.onDragTableCancel, this),
						onStart: onStart});

				}
				else {
					this.initSwipeForItem($item, $itemContent, $swipeIcon, Capriza.device.isMobile);
				}

				$('.swipe_btn', $swipeContainer).on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var $btnElement = $(this);
					var swipeControl = swipeActions.filter(function(swipeControl){
						return $btnElement.attr('id') === swipeControl.get('id');
					});
					if (swipeControl.length > 0) {
						swipeControl[0].api.click();
					}
				});
				$item.prepend($swipeContainer);
				return $swipeContainer;

			}

		});

		Capriza.Model.DrillPage = Capriza.Model.ContextPage.extend({
			initialize: function() {
				var self = this;
				this.tableDrill = true;
				Capriza.Model.ContextPage.prototype.initialize.apply(this, arguments);

				var drillPageChildControls = this.get('controls');

				drillPageChildControls.forEach(function(ctrl){
					ctrl.parent = self;
				});
				this.updatePages(drillPageChildControls[0]);


			},

			updatePages: function(control) {
				Capriza.Model.ControlDB[control.id].pages = [this];

				var self = this;

				var subcontrols = control.get("controls");
				if (subcontrols) {
					subcontrols.forEach(function(childControl){
						self.updatePages(childControl);
					});
				}
			},

			getDbKey: function() {
				return this.get("dbKey");
			},

			setControls:function(){
				Capriza.Model.Control.prototype.setControls.apply(this, arguments);
			},
			getContextId:function(){
				return Capriza.Model.Control.prototype.getContextId.apply(this, arguments);
			},
			addPage:function(page){
				//ignore this, it is only for Capriza.Model.Control compatibility
			}
		});


		Capriza.Views.DrillPage = Capriza.Views.ContextPage.extend({
			initialize: function() {

				_.bindAll(this, "render");
				Capriza.Views.ContextPage.prototype.initialize.apply(this, arguments);
				this.$el.addClass("table-drill").attr("data-mc", this.model.get("id")).attr("data-mctemplid", this.model.get("mcTemplId"));
				if (Capriza.isRTL) {
					this.$el.addClass('right-align');
				}

				var self = this;
				Dispatcher.off("switcherPrev/show");
				Dispatcher.on("switcherPrev/show", function($switcherBtn){
					var eventTrigger = Capriza.device.stock || Capriza.device.ios ? "touchend" : "click";
					$switcherBtn.off(eventTrigger).on(eventTrigger, function() {

						if (!$(this).hasClass('disabled')) {
							Logger.debug('switch up clicked');
							$(this).addClass("clicked");
							self.$el.trigger('drillPrevClicked');
							var _this = this;
							setTimeout(function(){$(_this).removeClass('clicked')}, 50);
						}

					});

					$switcherBtn.toggleClass('disabled', !self.hasPreviousDrill());
				});

				Dispatcher.off("switcherNext/show");
				Dispatcher.on("switcherNext/show", function($switcherBtn){
					var eventTrigger = Capriza.device.stock || Capriza.device.ios ? "touchend" : "click";
					$switcherBtn.off(eventTrigger).on(eventTrigger, function() {

						if (!$(this).hasClass('disabled')) {
							Logger.debug('switch down clicked');
							$(this).addClass("clicked");
							self.$el.trigger('drillNextClicked');
							var _this = this;
							setTimeout(function(){$(_this).removeClass('clicked')}, 50);
						}

					});
					Dispatcher.on("table/renderedChunk", function() {
						$switcherBtn.removeClass('disabled');
					});
					Dispatcher.on("table/waitingForItems", function(that) {
						$switcherBtn.toggleClass('disabled', !self.hasNextDrill.call(self));
					});

					$switcherBtn.toggleClass('disabled', !self.hasNextDrill());
				});

				if (this.model.get("shouldUseWebColor")) {

					this.model.get("controls").forEach(function(control) {
						self.propagateWebColorFlag(Capriza.Model.ControlDB[control.id], self.model.get("shouldUseWebColor"));
					})

				}
			},

			propagateWebColorFlag: function(control, shouldUseWebColorValue) {

				control.set('shouldUseWebColor', shouldUseWebColorValue);
				var self = this;
				if (!control.get('controls')) return;
				control.get('controls').forEach(function(childControl) {
					self.propagateWebColorFlag(Capriza.Model.ControlDB[childControl.id], control.get("shouldUseWebColor"));
				})
			},

			getRoot: function() {
				return Capriza.Model.Control.getById(this.model.get("controls")[0].id);
			},

			getControlsIds: function() {
				return this.model.get("controls").map(function(control){return control.id});
			},

			_post: function() {

				var tableId = Capriza.Model.ControlDB[this.model.get('id')].parent.get('id');

				this.$el.attr("id", this.getPageId()+'_backdrill_'+tableId);
			},

			hasNextDrill: function() {
				var rowControl = Capriza.Model.Control.getById(this.model.get('rowControlId'));
				if (!this.model.get('id') || !Capriza.Model.ControlDB[this.model.get('id')] || !rowControl){
					return;
				}
				var tableModel = Capriza.Model.ControlDB[this.model.get('id')].parent;

				var controlIndex = tableModel.get('controls').indexOf(rowControl.parent);

				return (controlIndex > -1 && controlIndex < tableModel.get('controls').length-2) || (tableModel && tableModel.get("yesMore") && !tableModel.waitingForItems);
			},

			hasPreviousDrill: function() {

				var rowControl = Capriza.Model.Control.getById(this.model.get('rowControlId'));
				var tableModel = Capriza.Model.ControlDB[this.model.get('id')].parent;

				var controlIndex = tableModel.get('controls').indexOf(rowControl.parent);

				return controlIndex > 0;

			},

			beforeBack: function(toPage) {
				Dispatcher.off("table/renderedChunk").off("table/waitingForItems");
				if (!toPage.hasClass('table-drill') && !toPage.hasClass('cdialog')) {
					this._clearHeader();
				}

			},

			destroy: function() {
				this._clearHeader();
				Dispatcher.off("table/renderedChunk").off("table/waitingForItems");
				Capriza.Views.PageView.prototype.destroy.call(this);
			},

			_clearHeader: function() {
				setTimeout(function(){
					$('.next-switcher').transition({"x": "0px"});
					$('.prev-switcher').transition({"x": "0px"});
					Dispatcher.trigger("header/remove");
				}, 0);
			},

			getViews: function(controls) {
				var self = this;
				controls = controls || this.model.get("controls")[0].get("controls").map(function(control) { return Capriza.Model.Control.getById(control.id); });
				return controls.map(function(control) { return self.getView(control.get("id")); }).filter(function(view) { return !!view; });
			}
		});

		Capriza.Views.Table = Capriza.Views.Group.extend({
			className: "table",
			drillPage: undefined,


			createAndAddControl: function(control){
				if(control.get("type") === 'drillPage') return;
				Capriza.Views.Group.prototype.createAndAddControl.apply(this, arguments);
			},

			getView: function(model) {
				if (model.get("type") === 'topLevel'){
					return new Capriza.Views.TableRow2({ model: model, page: this.options.page, table: this});
				}
				else {
					Logger.warn("getView of table should not be called with control other than topLevel");
				}
			},

			getFirstTopLevelControl: function() {
				var topLevelControls = this.getTopLevelControls();
				return topLevelControls.length > 0 && topLevelControls[0];
			},


			initInnerContainer: function() {
				return $("<ul class='rows'></ul>").appendTo(this.$el);
			},

			getTopLevelControls: function() {
				var controls = this.model.get('controls');
				var topLevelControls = controls.filter(function(control) {
					return (control.get && control.get('type') === 'topLevel') || control.type === 'topLevel';
				});
				return topLevelControls;
			},

			getMainControl: function(topLevelControl) {
				var mainControl = topLevelControl.get('controls').filter(function(control) {
					return control.get('type') === 'main';
				});
				return mainControl[0];
			},

			getSwipeActionsControl: function(topLevelControl) {
				var swipeActionsControl = topLevelControl.get('controls').filter(function(control) {
					return control.get('type') === 'swipeActions';
				});
				return swipeActionsControl[0];
			},

			addPhaseUI: function() {
				if (this.model.get("noDataEnabled") === false) return;

				var noDataText = this.model.get("noDataText") || Capriza.translator.getText(Capriza.translator.ids.noDataAvailable);

				var $partialSpinner = $("<li class='partial-phase-0-spinner empty-table-spinner'></li>").rotatingSpinner({
					width: "35px",
					height: "35px",
				});
				this.$innerContainer.prepend($partialSpinner).prepend("<li class='empty-table'>"+noDataText+"</li>");
				this.model.get("emptySpinnerOn") !== false && this.model.set("emptySpinnerOn", true);
			},

			closeAllSwipes: function() {
				var firstTopLevelControl = this.getFirstTopLevelControl();
				if(firstTopLevelControl) {
					var tableRowView = this.options.page.getView(firstTopLevelControl.id);
					tableRowView && tableRowView.closeAllOtherSwipes();
				}
			},

			_render: function() {
				Logger.debug('render of table has started');
				var self = this, controls = this.model.get("controls");
				this.$el.attr("id", this.getUniqueControlId() || "");

				this.addPhaseUI();

				if (this.isTableHasSwipeActions()) {
					this.$el.addClass('swipe');
					Dispatcher.on('control/action/end pageView/tabChange', function(control) {
						var controlId = (control && control.model && control.model.get("id")) || control;
						Logger.debug('Closing all swipes due to clicking on ' + controlId);
						self.closeAllSwipes();
					}, this);
				}

				if (this.isTableHasDrillPage()) {
					this.$el.addClass('drill');
				}

				if(this.model.get("phase") === undefined)
					_.each(this.model.get('controls'), this.addTopLevelControl, this);

				var firstLine = this.$('li.row')[0];
				firstLine && $("*", $(firstLine)).removeClass('highlighted');

				self.refreshEmpty();

				this.addPaginator();
				this.setPresentedControlCount();

				var topLevelControls = this.getTopLevelControls();
				this.renderedCount = topLevelControls && topLevelControls.length;

				this.options.page.listeningToPageChange = (this.options.page.listeningToPageChange || []);
				if (this.options.page.listeningToPageChange.indexOf(self.model.get("id")) === -1) {
					this.options.page.listeningToPageChange.push(self.model.get("id"));

					Dispatcher.on("page/back/before", function(data) {
						Logger.debug("[Table] received 'page/back/before' to: " + data.toPage.data("pageView"));
						if (data.toPage.data("pageView") === self.options.page) {
							var tableView = self.options.page.getView(self.model.get("id"));
							if (tableView) { // if the view was already deleted from the page. TODO: WARNING SIGN!!! too many bugs with this piece of code. should be transferred to the page view.
								Logger.debug(self.model.get("id") + ": setting inDrill to false (cid=" + tableView.cid + ")");
								self.options.page.inDrill = false;
								delete self.options.page.model.drillIndex;

								//notify the page the drill is not "blocking" anymore..
								Capriza.Views.UiControl.prototype.unblockPage.apply(self);
							}
						}
					});
				}

				if (this.model.get("partialPhase") !== undefined) {
					this.$el.addClass("partial-phase-" + this.model.get("partialPhase"));
				}
				if (this.model.get("phase") > 0) {
					this.$el.addClass("partial-phase-" + 2);
				}

				if (this.options.page.inDrill === this.model.get('id')) {
					this.keepDrillUiState();
				}

				this.initHint(this.getSwippableItem());

				return this.$el;
			},

			initHint: function($hintedElement) {

				if (!this.options.page.hinted && this.isTableHasDrillPage() && this.isTableHasSwipeActions()) {

					//There is something wrong with chrome 36 for android that this hint screws up the swipe. ran out of
					//time for investigating...disabling for now
					if (!Capriza.device.isMobile || (Capriza.device.isMobile && !Capriza.device.chrome)) {
						Logger.debug('going to show hint');
						setTimeout(this.hintSwipe.bind(this, $hintedElement), 300);
						this.options.page.hinted = true;
					}

				}
			},

			//TODO:fix rendering
			renderChunk: function(startIndex) {
				Logger.debug('render chunk started with '+startIndex);
				var self = this;
				var newControls = self.getTopLevelControls().slice(startIndex);
				_.each(newControls, function(control, i) {
					self.createAndAddControl(control);

					self.addTopLevelControl(control, (startIndex+i)*2);
				});

				Dispatcher.trigger("table/renderedChunk");

				Logger.debug('render chunk ended with '+startIndex);

				self.setMcStyle();
			},

			hintSwipe: function($hintedElement) {
				$(".swipe_cell",$($hintedElement).parent()).addClass("show-swipe-actions");
				$hintedElement.transition({ 'x': '-15%' }, function(){
					$(this).transition({ 'x': '0%'},function(){
						if (!$($hintedElement).hasClass('swipe-shown')) //#20934
							$(".swipe_cell",$($hintedElement).parent()).removeClass("show-swipe-actions");
					}).removeClass('hinting');
				}).addClass('hinting');
			},

			initDrillPage: function(data) {

				data.parentPage = this.options.page.model;
				data.contextId = this.options.page.model.get('contextId');
				data.tableId = this.model.get('id');
				data.shouldUseWebColor = this.model.get('shouldUseWebColor');

				var drillPage = new Capriza.Model.DrillPage(data);
				drillPage.parent = Capriza.Model.ControlDB[drillPage.get("id")].parent;
				Capriza.Model.ControlDB[drillPage.get("id")] = drillPage;
				return drillPage;
			},

			onDrillPrevClicked: function() {


				var prevRowId = this.getNextRowId(-2);

				if (prevRowId) {
					this.doDrill(prevRowId, { transition: "none", headerTransition: "flip", reverse: true, notInStack: true, replaceInStack: true});
					$(".prev-switcher>.value").focus();

					var toPage = this.drillPage ? this.drillPage.$el : undefined;
					$(document).trigger("pagechange", { toPage:toPage });
				}


			},

			onDrillNextClicked: function() {
				var nextRowId = this.getNextRowId(2);
				this.getNextRowsFromDrill();
				if (nextRowId) {

					this.doDrill(nextRowId, { transition: "none", headerTransition: "flip", notInStack: true, replaceInStack: true});
					$(".next-switcher>.value").focus();

					var toPage = this.drillPage ? this.drillPage.$el : undefined;
					$(document).trigger("pagechange", { toPage:toPage });
				}
			},

			getNextRowsFromDrill: function(){
				if (this.model.get("yesMore") && !this.waitingForItems && this.drillIndex/2 > this.renderedCount - 4) {
					this.waitingForItems = true;
					this.model.waitingForItems = true;
					this.model.api.getMoreItems(this.renderedCount);
					Dispatcher.trigger("table/waitingForItems", this);
				}
			},

			getNextRowId: function(step) {
				var currIndex = this.drillIndex, nextViews, result = undefined;


				if (!this.$el.hasClass('tabular')) {
					nextViews = _.values(this.options.page._views).filter(_.bind(function(view) {
						var tableId = this.model.get('id');

						if (view.rowIndex || view.rowIndex === 0) {
							var viewParentId = view.model.parent.parent.id;
						}

						return view.rowIndex === currIndex + step && tableId === viewParentId;
					}, this));

					nextViews.forEach(function(nextView) {
						if (nextView.$el.css('display')) {
							result = nextView;
						}
					});

					return result && result.model.get('id');
				}
				else {
					this.$("tr").each(function() {
						if ($(this).data('rowIndex') === currIndex + step) {
							result = $(this).data('model').id;
						}
					});
					return result;
				}



			},

			addTopLevelControl: function(control, i) {
				if (control.get('type') !== 'topLevel') return;
				this.renderedCount++;

				var view = this.options.page.getView(control.get("id"));

				view.rowIndex = i;
				view.render().appendTo(this.$innerContainer);

			},

			isTableHasDrillPage: function() {
				return this.model.get("hasDrillPage");
			},

			isTableHasDrillPageControls: function() {
				var controls = this.model.get("controls");
				var hasAnyDrillPage =  controls.some(function(control) {
					return control.get('type') === 'drillPage';
				});
				return hasAnyDrillPage;
			},

			isTableHasSwipeActions: function() {

				var topLevelControls = this.getTopLevelControls();
				if (topLevelControls.length === 0) return false;
				var controls = topLevelControls[0].get("controls");
				var swipeActionsSections =  controls.filter(function(control) {
					return control.get('type') === 'swipeActions' && control.get('controls') && control.get('controls').length > 0;
				});
				return swipeActionsSections.length > 0;
			},

			isTableHasSelectable: function(topLevelControl) {
				var mainControl = this.getMainControl(topLevelControl);
				var selectControl = mainControl.parent.get('controls').filter(function(control){return control.get('type') === 'groupSelector';});

				return selectControl.length > 0 && !this.isTableHasSwipeActions();
			},

			getSwipeActions: function(topLevelControl) {//used in ILEBars
				var swipeActionsSections =  topLevelControl.get('controls').filter(function(control) {
					return control.get('type') === 'swipeActions';
				});
				return swipeActionsSections.length > 0 && swipeActionsSections[0];
			},

			getSwippableItem: function($item) {
				$item = $item || this.$('.row-wrap').first();
				return this.getRowSubElement($item);

			},

			getRowSubElement: function($item) {
				return $item.children(".row-box");
			},

			doDrill: function(rowControlId, options) {
				var self = this;
				self.drillItemId = rowControlId;

				if (Capriza.compatMode) {
					delete self.drillPage.scrollPosition;
				}

				self.drillPage = self.buildDrillPage(rowControlId);


				if (self.scrollDetector) {
					self.scrollDetector.stop();
					Dispatcher.once("page/back/after", function() {
						self.scrollDetector.start();
					});
				}

				this.options.page.inDrill = this.model.get('id');

				if (this.$el.hasClass('tabular')) {
					var trEl = this.$("tr").filter(function(){
						return $(this).data('model') && $(this).data('model').id === rowControlId;
					});

					self.drillIndex = trEl.data('rowIndex');
				}
				else {

					self.drillIndex = this.options.page.getView(rowControlId).rowIndex;

				}
				self.options.page.model.drillIndex = self.drillIndex;
				self.drillPage.model.set("rowControlId", rowControlId);
				self.drillPage.render();
				options.fromPage = this.options.page;
				self.drillPage.show(options);

				//inherited from uiControl, notifies the page that this control now blocks the entire page,
				//until "unblockPage" or "back" are called
				this.notifyBlockPage();

				self.trigger("table/drill", self.drillPage);
			},

			getDrillPageDBID: function() {
				return "page_"+this.options.page.model.get("id")+"_table_"+this.model.get('id')+"_drillPage";
			},


			buildDrillPage: function(rowControlId) {


				var rowControl = Capriza.Model.ControlDB[rowControlId];
				var drillPageData = this.getDrillPageData(rowControl.parent.get('refId'));
				var contentToRemove = $(".table-drill[id*=backdrill_"+this.model.get('id')+"]");
				if (contentToRemove.length > 0) {
					contentToRemove.remove();
				}

				var drillPageModel = this.initDrillPage(drillPageData.toJSON());
				var pageView = new Capriza.Views.DrillPage({ model: drillPageModel });

				if (this.model.get("partialPhase") === 1 || this.model.get("phase") > 0) {
					pageView.$el.addClass("loading-page").append('<div class="spinner"></div>');
				}

				if (this.model.get("shouldUseWebColor") && drillPageData.get('style')) {
					pageView.$el.css(drillPageData.get('style'));
				}

				pageView.$el.on("drillPrevClicked", _.bind(this.onDrillPrevClicked, this));
				pageView.$el.on("drillNextClicked", _.bind(this.onDrillNextClicked, this));
				return pageView;
			},

			getDrillPageData: function(refId) {
				var controls = this.model.get('controls');
				var filteredResults = controls.filter(function(control) {
					return control.get('refId') === refId && control.get('type') === 'drillPage';
				});

				return filteredResults[0];

			},

			setControls: function() {

				Capriza.Views.Group.prototype.setControls.apply(this, arguments);
				this.refreshEmpty();

				if (this.options.page.inDrill) {
					this.keepDrillUiState();
				}

			},

			keepDrillUiState: function(){

				Logger.debug('keepDrillUiState started');

				var self = this;

				function handleInDrill() {
					var succeededDrill = self.keepInDrill(self.drillItemId, self.options.page.model.drillIndex);
					if (!succeededDrill) self.options.page.show({ transition: "none" }).$el.css({ x: 0 });
				}

				// If table gets controlUpdates and the view is inside the drill page - try to find the same row ID.
				// If the row IDs have changed - try to go to the row in the same index (fair assumption? TiVo thinks so ...)
				// If there isn't a row at that index - go back to the table page

				if ($(".viewport").hasClass("transitioning")) { // fix to #7272
					Dispatcher.once("page/change/after", function() {
						handleInDrill();
					});
				} else {
					handleInDrill()
				}

			},

			keepInDrill: function(drillItemId, drillIndex) {

				Logger.debug('keepInDrill started with '+drillItemId+' drill index is '+drillIndex);

				if(!this.isTableHasDrillPage()){
					Logger.debug('cannot keepInDrill as there are no drill pages');
					this.options.page.inDrill = false;
					delete this.options.page.model.drillIndex;
					return;
				}

				var rows = this.model.get("controls");
				if (rows.some(function(x) { return drillItemId == x.get("id"); })) {
					Logger.debug("keeping drill in the same row");
				} else if (rows.length > drillIndex) {

					var topLevelControl = rows[drillIndex];
					Logger.debug('looking for '+topLevelControl.get('type')+' '+topLevelControl.get('id')+' main control')
					var mainControlArray = topLevelControl.get('controls').filter(function(control){return control.get('type') === 'main';});
					drillItemId = mainControlArray[0].get("id");
					Logger.debug("simulating drill on the same index row");
				} else {
					Logger.debug("can't keep drill on row");
					drillItemId = null;
				}

				var lastPage = $.capriza.pages[$.capriza.pages.length-1];
				if ($(lastPage).hasClass('table-drill')) {
					$.capriza.pages.pop();
				}

				if (drillItemId) {
					this.doDrill(drillItemId, {transition: "none"});
					try{
						this.reportInteraction({
							element: "Table",
							interaction: "click",
							controlPath: "#" + this.model.get("id") + " [data-mc='"+drillItemId+"'] + div",
							rowId: drillItemId,
							rowIndex: this.drillIndex
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Table do drill interaction");
					}
				}
				return drillItemId;
			},

			_refreshEmpty: function() {
				var controls = this.model.get("controls"), isEmpty = (this.model.get("partialPhase") !== 0 && (!controls || !controls.length)) || (this.model.get("phase") > 0);
				this.$(".empty-table").toggleClass("active", isEmpty);
			},

			refreshEmpty: function() {
				var self = this, controls = this.model.get("controls"), isEmpty = (this.model.get("partialPhase") !== 0 && (!controls || !controls.length)) || (this.model.get("phase") > 0);

				clearTimeout(this.showEmptyTableMsg);

				if(!isEmpty) {
					this.$(".empty-table, .empty-table-spinner").removeClass("active");
					this.model.set("emptySpinnerOn", false);
					return;
				}
				if (this.model.get("partialPhase") !== 0 && this.model.get("emptySpinnerOn") === false){
					self.$(".empty-table").addClass("active");
					return;
				}
				this.$(".empty-table-spinner").addClass("active");
				this.showEmptyTableMsg = setTimeout(function(){
					self.$(".empty-table").addClass("active");
					self.$(".empty-table-spinner").removeClass("active");
					self.model.set("emptySpinnerOn", false);
				}, self.model.get("noDataTimeout") || 4000);
			},

			//This method is called from the page, when the page wants to close/clear "blocking" controls
			unblockPage: function(){
				if (!this.destroyed) $.capriza.backPage();
			},

//        update: function() {
//            Capriza.Views.Group.prototype.update.apply(this, arguments);
//            if (this.model.get("hasNext") || this.model.get("hasPrevious")) {
//                $.capriza.activePage.data('pageView') && $.capriza.activePage.data('pageView').scrollTo(0, this.el.offsetTop);
//            }
//        }

			update: function(attributes) {
				Capriza.Views.Group.prototype.update.apply(this, arguments);
				var parent = this.$el.parent()[0];
				if (!attributes.hasOwnProperty('yesMore') && this.model.get("hasPrevious") && parent) {
					parent.scrollTop = this.el.offsetTop;
				}
				Dispatcher.trigger('table/updated', this.$el);
			},
			_destroy: function() {
				Capriza.Views.Group.prototype._destroy.apply(this, arguments);
				if (this.drillPage) {
					this.drillPage.getViews().forEach(function(view){
						view.destroy();
					});
					Capriza.Views.UiControl.prototype.unblockPage.apply(this);
				}
			},

			//meant to allow click on a table row (drill) when mvp is displayed
			shouldAllowClickWhenDisabled: function(data){
				if (!data) return false;

				var row = $(data.event.target).closest(".ui-control.row-wrap").data("uicontrol");
				return row && row.model && row.model.get('type') == 'topLevel';
			}
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/TabularView.js

try{
	;(function() {

		var testElement = document.createElement('div');

		var flexPrefix = "flex" in testElement.style ? "flex" : "-webkit-flex";

		Capriza.Views.Tabular = Capriza.Views.Table.extend({
			_render: function() {

				this.$el.addClass('tabular-view');

				Capriza.Views.Table.prototype._render.apply(this, arguments);

				if (!this.model.get("hideHeaders")) this.setHeaders();
				return this.$el;

			},

			setHeaders: function() {
				this.$('.rows').prepend($('<li class="tabular-headers" ></li><li style="display:none"></li>'));

				var headers = this.getHeaders(), $headersContainer = this.$('.tabular-headers'), self = this;

				if (this.getFirstTopLevelControl() && this.isTableHasSelectable(this.getFirstTopLevelControl())) {
					$headersContainer.addClass('has-selectable').prepend('<div class="table-header-selectable"></div>');
				}

				headers.forEach(function(header) {
					var flexValue = header.columnData && header.columnData.flex || "";
					$('<div class="tabular-header">'+header.key+'</div>').css(flexPrefix, flexValue).appendTo($headersContainer);
				});
			},

			getHeaders: function() {
				var firstTopLevelControl = this.getTopLevelControls()[0];
				if (!firstTopLevelControl) return [];
				var mainControl = this.getMainControl(firstTopLevelControl), columnData = this.model.get("columnData") || [];
				return mainControl.get('controls').map(function(control, index) {
					var columnDataAtIndex = columnData[index],
					    key = (columnDataAtIndex && columnDataAtIndex.key) || control.get('key') || "";

					return {
						key: key,
						columnData: columnDataAtIndex
					};
				});
			}
		});

	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Link.js

try{
	/**
	 * Created with JetBrains WebStorm.
	 * User: oriharel
	 * Date: 11/15/12
	 * Time: 5:30 PM
	 * To change this template use File | Settings | File Templates.
	 */
	;(function() {
		Capriza.Views.Link = Capriza.Views.UiControl.extend({
			action: "click",
			widget: "link",

			getWidget: function(){
				return this.model.get("widget") || this.widget;
			},

			_render: function() {
				var self = this;
				var model = _.extend(this.model.toJSON(), { uniqueControlId: this.getUniqueControlId() });

//          recognized as file url
				var href = this.model.get("href");
				if (href) {
					Utils.Links.createExternalLink(this);
				} else {
					var widgetName = this.getWidget();
					this.$el[widgetName](model).on(widgetName.toLowerCase() + "_click", function() {
						self.model.api[self.action]();
						return false;
					});
				}

				this.$(".value").on("click", function(e) {
					try{
						this.reportInteraction({
							element: "Engine Link",
							interaction: "click"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Engine link click interaction");
					}
					e.stopPropagation();
					Dispatcher.trigger("control/action/end",self);
				});

				return this.$el;
			},

			setName: function(name) {
				this.$el[this.widget]("setText", name);
			},

			setIsDisabled: function(){
				Capriza.Views.UiControl.prototype.setIsDisabled.apply(this, arguments);
				//update the widget as well
				this.$el[this.getWidget()]("setIsDisabled", this.model.get("isDisabled"));

			}
		});

		Capriza.Views.ClientLink = Capriza.Views.Link.extend({
			_render: function(){
				var model = _.extend(this.model.toJSON(), { uniqueControlId: this.getUniqueControlId() });
				if (!model.data) model.icon = null;
				this.$el["link"](model);

				return this.$el;
			},
			_post: function() {
				var linkType = this.model.get('clientLinkType');
				switch (linkType) {
					case "externalLink":
					case "zappLink":
					case "phone":
					case "email":
					case "address":
					{
						var options = this.model.attributes;
						if (options) {
							options.target = this.$(".value");
							this.$el[linkType](options);
							this.$(".value")[0].href = this.$el[0].action;
						}
						break;
					}
				}
				this.$el.addClass(linkType).addClass("user-action");
			},
			setData: function(){
				var linkType = this.model.get('clientLinkType');
				switch(linkType){
					case "externalLink":
					case "zappLink":
					case "phone":
					case "email":
					case "address":{
						var options = this.model.attributes;
						if (options) {
							this.$el[linkType]("setData", options);
							this.$(".value")[0].href = this.$el[0].action;

							//if there is data, set the icon, else remove the icon
							if (options.data)
								this.$el["link"]("setIcon", options.icon);
							else
								this.$el["link"]("setIcon", null);
						}
						break;
					}
				}
			},
			onClick: function() {
				try {
					this.reportInteraction({
						element: (this.model.get('clientLinkType') || "").capitalize() + " Link (Client)",
						interaction: "click",
						data: this.model.get("data")
					});
				} catch(e){
					Logger.info("[UserInteraction] Fail to report Client Link interaction");
				}
				//ToDo: should enable send stats to engine
			}
		});

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Image.js

try{
	;(function() {
		Capriza.Views.Image = Capriza.Views.UiControl.extend({
			tagName: "div",

			_render: function() {
				var model = _.extend(this.model.toJSON(), { uniqueControlId: this.getUniqueControlId() }), self = this;

				this.$el.image(model);
				this.$el.image('addClassToImage', 'hidden');

				this.$el.image('onLoad', function() {
					self.$el.image('removeClassToImage', 'hidden');
					setTimeout(self.trigger.bind(self, "image/loaded"), 300);
				});

				this.setSrc();
				return this.$el;
			},


			setSrc: function() {

				if (this.model.get("isBackgroundImage")) {

					this.$el.image("setBackgroundImage", this.model.get("src") || "", this.model.get("backgroundPosition") || "center", this.model.get("backgroundSize") || "cover");
				}
				else {
					this.$el.image("setSrc", this.model.get("src") || "");
				}

			},

			applyMcSize: function(){

				if (this.model.get("mcSize")) {
					$('img', this.$el).css(this.model.get("mcSize"));
				}
			}

		});

		Capriza.Views.ImageLink = Capriza.Views.Image.extend({
			_render: function() {
				Capriza.Views.Image.prototype._render.apply(this, arguments);
				var self = this;
				this.$el.on("image_click", function() {
					self.model.api.click();
					return false;
				});

				return this.$el;
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Textbox.js

try{
	;(function() {

		function textBoxOnWidowResize(){
			if(document.activeElement.tagName=="INPUT" || document.activeElement.tagName=="TEXTAREA"){
				window.setTimeout(function(){
					document.activeElement.scrollIntoViewIfNeeded();
				},0);
			}
		}
		// fix ##13545 - Input on the page's bottom gets hidden by the keyboard on focus for Android.
		// FIX for iOS is in done below by listening to each click inside the input field
		if (Capriza.device.android) {
			window.addEventListener("resize", textBoxOnWidowResize);
		}

		Handlebars.registerHelper('textboxClass', function() {
			var klass = this._textboxClass;
			if (this.isSubmittable) klass += " submittable";
			if (this.multiline) klass += " multiline";
			return klass;
		});

		// Repositions popover on window resize
		function windowResized(event) {
			var control = event.data.control;

			// avoid blocking UI by high-rate repositionings
			if (!control.isPositioningPopover) {
				control.isPositioningPopover = true;

				requestAnimationFrame(function () {
					control.positionPopOver();
					control.isPositioningPopover = false;
				});
			}
		}

		Capriza.Views.TextboxBase = Capriza.Views.HandlebarsUiControl.extend({
			template: "textbox",
			inputType: "text",
			textboxIcon: "fa fa-times-circle",
			textboxClass: "textbox",
			isPositioningPopover: false,

			////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////

			isDropdownEnabled: function(){
				return !!this.model.get("cacheKey") || !!this.model.get("cacheData");
			},

			options : {
				hasInput    : true,
				opener      : true,
				openerIcon  : "fa fa-caret-down",
				button      : false,
				multi       : false,
				filterable  : false,
				hideOnEmpty : false,
				showWhenReadOnly:false,

				sortByHist  : true,
				allowUnselect: false
			},

			initialize: function() {
				if(this.isDropdownEnabled()) {
					var self = this;
					var typeAdapter = this._types[this.model.get("type")];
					_.extend(this, typeAdapter);

					_.extend(this.options, this.opts);
					this.options.multi = this.model.get("multiple") != undefined ? this.model.get("multiple") : this.options.multi;
					["modal", "openerIcon", "sortByHist", "filterable"].forEach(function (prop) {
						if (self.model.get(prop) !== undefined) {
							self.options[prop] = self.model.get(prop);
						}
					});

					if(this.options.modal && (this.options.hasInput || this.options.filterable)){
						this.options.modalInput = true;
					}

					Capriza.Model.Caching.initCaching(this.model);

					this.model.set("rows", []);
					this.model.set("filteredSortedRows", []);
					this.model.on("change:textValue", this.model.onTextValueChanged);
				}
				this._initialize && this._initialize();

			},

			removeDropdown: function () {
				if (this.$modalOver) this.$modalOver.remove();

				if (this.$popOver) {
					this.$popOver.remove();
					$(window).off("resize", windowResized);
				}
				this.$rows = undefined;
			},

			_destroy:function(){
				this.trigger("dropdown:destroy");
				textBoxOnWidowResize && window.removeEventListener("resize",textBoxOnWidowResize);
				this.removeDropdown();
				Utils.shieldDown("dd"+this.model.get("id"));
			},



			_post: function() {

				var self = this;
				setTimeout(function(){
					self.on("selectItems", function(){
						self.trigger("itemsSelected");
					})
				}, 10);
				if(this.isDropdownEnabled()) this.renderDropdown();

				if(this.options.hasInput) {
					this._addMaxLengthValidation(this.getInput(true));
				}

				if (this.isBarcode()){
					this.$el.addClass("barcode");
				}

			},

			renderDropdown: function () {
				var self = this;
				this.$el.addClass("dropdown");


				this.setIsReadOnly(); //TODO: enable this ? yes, please. it's not executed generically by UiControl even though it's defined there. why? because.
				this.model.on("change:rows", this.filterAndSortRows, this);
				this.model.on("change:filteredSortedRows", this.populateItems, this);
				this.model.on("change:textValue", this.fillValue, this);
				this.fillValue();
				this.filterAndSortRows();

				this.addUiEventListeners();
				if (this.options.hasInput) {
					this.checkEmpty();
				}

				this.onScroll = function(){
					self.hideDropdown(true);
				};
			},

			addDropdownEventListeners:function(){
				var self = this;
				var onclick = function (e) {
					if(self.$items[0] == e.target || self.$rows[0] == e.target) {return;/* in modal when clicked outside an item we should ignore the click*/}
					var items = self.model.get("rows").filter(function (itm) {
						if(itm.shouldSelect){itm.selected = true;}
						else{delete itm.selected;}
						delete itm.shouldSelect;
						return itm.selected;
					});
					self.trigger("selectItems", items);
					self.hideDropdown();

					try{
						self.reportInteraction({
							element: "TextBox",
							interaction: "click",
							controlPath: "[data-modal-mc="+self.model.get("id")+"] .dd-save"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Text box save dd interaction");
					}
				};

				var eventsMap = Capriza.device.isMobile ? {click: onclick}
					: {click: onclick,
						mousedown: function () {self.keepDropdown = true}};

				(this.options.multi ? this.$save : this.$items).off(eventsMap).on(eventsMap);

				if(this.options.modalInput){
					var modalKeyUp = function(e){
						self.checkEmpty();
						self.trigger("modalInputKeyUp", e);
					};
					this.getInput().on("keyup",modalKeyUp);
					if(Capriza.device.ios){
						this.getInput().on("focus",function(e){
							var vh = Capriza.cordova && window.top.innerHeight > 0  ? window.top.innerHeight : "45%";
							self.$modalOver.css("height" , vh);
							self.$modalInput && self.$modalInput.length && setTimeout(function() {
								self.$modalInput[0].scrollIntoViewIfNeeded();
							}, 300);
						}).on("blur",function(){
							self.$modalOver.css("height" , "");
						});
					}
				}
			},

			// Overrides to make a field marked by CSS class "focusable" get focus
			// or prevent focus according to its "isDisabled" state
			setIsDisabled: function () {
				Capriza.Views.HandlebarsUiControl.prototype.setIsDisabled.call(this);

				if (this.model.get("isDisabled")) {
					this.$(".focusable").attr("tabindex", -1);
				} else if (!this.model.get("isReadOnly")) {
					this.$(".focusable").attr("tabindex", 0);
				}
			},

			// Calls a handler for keyboard events
			_onKeyDown: function (event) {
				var s = {9: "_onTab", 13: "_onEnter", 27: "_onEscape",
					32: "_onSpace", 35: "_onEndOrHome", 36: "_onEndOrHome",
					38: "_onArrowUp", 40: "_onArrowDown"}[event.which];

				s && this[s](event);
			},

			// Hides dropdown
			_onTab: function () {
				this.hideDropdown(true);
			},

			// Hides dropdown
			_onEscape: function (event) {
				this.shown && event.stopPropagation();
				this.hideDropdown(true);
			},

			// Simulates a click to select an item if popup is open
			_onEnter: function (event) {
				var $rows = this.$rows;
				var item = ($rows ? $rows.children(".focused")[0] : null);

				if (item) {
					// simulate click to select item and put the focus back
					this.getInput(true).blur();
					item.click();
				} else if (event.which == 13) {
					// no item to select, close dropdown if shown

					try{
						var controlPath = "[data-modal-mc="+this.model.get("id")+"]";
						if ($(controlPath + " .dd-close").length){
							controlPath += " .dd-close";
						} else {
							controlPath += " .dd-save";
						}
						this.reportInteraction({
							element: "DropDown",
							interaction: "click",
							controlPath: controlPath
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Text box enter dd interaction");
					}
					this.hideDropdown(true);
				}

				var $v = this.$(".focusable");

				setTimeout(function () {$v.focus()}, 0);
			},

			// Space works like Enter on textboxes without input
			_onSpace: function (event) {
				if (!this.opts.hasInput) {
					event.preventDefault();
					Capriza.Views.Textbox.prototype._onEnter.call(this, event);
				}
			},

			// Moves selection to last/first item in popup
			_onEndOrHome: function (event) {
				if (this.shown) {
					var $items = this.$rows.children();
					var i = $items.filter(".focused").index();

					(event.which == 36) ? this._moveItemFocus(-i)
						: this._moveItemFocus($items.length - 1 - i);

					event.preventDefault();
				}
			},

			// Arrow up - moves selection inside a popup (if shown).
			// Alt + Arrow up - cancels items popup
			_onArrowUp: function (event) {
				if (event.altKey) {
					this.hideDropdown(true);
				} else if (this.shown) {
					this._moveItemFocus(-1);
				}
				event.preventDefault();
			},

			// Opens popup or moves selection inside it (if already open)
			_onArrowDown: function (event) {
				if (this.shown) {
					// popup is shown, move selection inside it
					this._moveItemFocus(1);
				} else if (this.model.get("isReadOnly")
					&& !this.options.showWhenReadOnly) {

					// popup is not shown and it's a readonly field
					// simulate a click on action button to open popup
					this.$actionButton.click();
				} else {
					// popup is not shown, open it
					this.showDropdown();
				}

				event.preventDefault();
			},

			// Moves a selection inside items popup
			_moveItemFocus: function (delta) {
				var $items = this.$rows.children();
				var $focusedItem = $items.filter(".focused").removeClass("focused");
				var index = ($focusedItem.index() + delta);
				var i = (index < 0) ? ($items.length - 1) : (index % $items.length);
				var $v = $items.eq(i).addClass("focused");

				$v[0] && $v[0].scrollIntoView(false);
			},

			addUiEventListeners: function () {
				var self = this;

				this.$openerButton = this.$("button.opener");
				this.$openerButton.on("click", _.bind(this.toggleDropdown, this));

				//this (re #13688) was commented due to several regressions of opening dropdowns in ios.
				//if(this.options.hasInput && Capriza.device.ios) {
				//    this.$(".value").find("input, textarea").on("focus", _.bind(this.toggleDropdown, this));
				//}

				//"focus" "click"
				this.$(".focusable").on("click", _.bind(this.toggleDropdown, this));

				if (Capriza.device.isDesktop) {
					this.$(".focusable").on(
						"keydown", _.bind(this._onKeyDown, this));
				}
				this.$actionButton = this.$("button.action-button");
				this.$actionButton.on("click", function(e){
					self.trigger("actionClicked", e);
					e.stopPropagation();
				});

				this.$clearIcon = this.$("button.clear");
				this.$clearIcon.mousedown(function () {self.keepDropdown = true});
				this.$clearIcon.on("click", function() {
					if (self.model.get("isReadOnly")) return false;
					try{
						self.reportInteraction({
							element: "TextBox",
							interaction: "click",
							controlPath: "#"+self.$el.prop("id") + ".icon.clear",
							additionalData: "Clear Text",
							"old-value": self.model.get("encrypt") ? "$$Encrypted$$" : self.getInput(true).val()
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Text box clear text interaction");
					}
					self.getInput(true).val("");
					self.model.set("textValue", "");
					self.model.api.setText("");
					if(self.options.filterable) {self.filterAndSortRows()}
					// TODO (amit): crappy solution for #6791 - did it quickly for BMC
					if (self.$el.closest(".list,.table").length === 0) {
						self.getInput(true).focus();
					}
					self.trigger("clear:input");
					return false;
				});

				if(self.options.hasInput) {
					this.getInput(true).on("keyup", function (e) {
						self.checkEmpty();
						self.trigger("controlInputKeyUp", e);
						// If entered from next (tab) command the Click event wasn't dispatched
						if(e.keyCode == 9){
							self.toggleDropdown(e);
						}
					}).on("keydown", function(e){
						// If leaving with next (tab) command the Blur event wasn't dispatched
						if(e.keyCode == 9){
							self.changeListener();
						}
					});
				}

				this.listenToChange();

				var $input = this.getInput(true).on("focus", function(e){
					Dispatcher.trigger("textBox/inputFocused", self);
					self.trigger("inputFocused", e);
				}).on("click", function(e){
					// fix ##13545 - Input on the page's bottom gets hidden by the keyboard on focus for iOS.
					// FIX for Android is in done above by listening to window resize
					if(Capriza.device.ios) {
						setTimeout(function(){
							self.getClosestScrollingContainer().off("scroll",self.onScroll);
							//self.getScrollingContainer().off("scroll",self.onScroll);
							if($input[0].scrollIntoViewIfNeeded) $input[0].scrollIntoViewIfNeeded();
							self.getClosestScrollingContainer().on("scroll",self.onScroll);
							//self.getScrollingContainer().on("scroll",self.onScroll);
						},100);
					}
					self.trigger("inputClicked", e);
				});

				this.trigger("uiEventListenersAdded");

			},

			listenToChange:function(){
				var self = this;

				if(!self.touchingRegistered){
					self.touchingRegistered = true;
					this.$clearIcon = this.$("button.clear");
					this.$clearIcon
						.on("touchstart mousedown",function(){
							self.$clearIcon.toggleClass("touching",true);
						}).on("touchend mouseup",function(){
						setTimeout(function(){
							self.$clearIcon.toggleClass("touching",false);
						},10);
					});
				}

				this.changeListener = this.changeListener || function(e){
						var $inputElement = self.getInput(true);
						var touchedClear = !!self.$(".clear.touching")[0];
						var eventClear = false;
						if (Capriza.device.firefox){
							var origClear = e && e.originalEvent && $(e.originalEvent.explicitOriginalTarget);//For Firefox
							eventClear = origClear && origClear.classList && origClear.classList.contains("clear") && origClear.parentElement == $inputElement[0].parentElement ;//For Firefox
						} else {
							var relatedClear = e && e.relatedTarget;
							eventClear = relatedClear && relatedClear.classList && relatedClear.classList.contains("clear") && relatedClear.parentElement == $inputElement[0].parentElement;//For Chrome
						}
						var activeIsClear = $(document.activeElement).hasClass("clear") && document.activeElement.parentElement == $inputElement[0].parentElement;

						self.hideDropdown(true, e);

						if(eventClear || activeIsClear || touchedClear ) return;
						var val = self.model.get("textValue") === undefined ? self.model.get("text") : self.model.get("textValue");
						if($inputElement.val() != val) {
							self.trigger("change", e);
						}
					};
				this.getInput(true).on("blur",this.changeListener);
			},

			stopListenToChange:function(){
				this.getInput(true).off("blur",this.changeListener);
			},

			filterAndSortRows:function(e){

				var self= this;
				var isOpener = self.isOpener || e && e.target && ($(e.target).hasClass("opener") || $(e.target).closest("button").hasClass("opener"));

				var rows = this.model.get("rows") || [];
				if(this.options.filterable && !isOpener){
					var $input = this.getInput();
					var filter = $input && $input.val();
					if(filter) {
						var regExp = new RegExp(".*" + filter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ".*", 'i');
						rows = rows.filter(function (itm) {
							return regExp.test(itm.text) || (itm.additional && itm.additional.length > 0 && itm.additional.some(function(a){
									return regExp.test(a.text);
								}));
						});
					}
				}

				if(self.options.sortByHist){
					rows.sort(function(a, b){
						if(a.hist == undefined && b.hist == undefined) return a.idx - b.idx; //No hist sort by index
						if(a.hist > -1 && b.hist == undefined) return -1; //hist always first
						if(b.hist > -1 && a.hist == undefined) return 1; //hist always first
						return a.histIdx - b.histIdx; //sort by hist index
					});
				}
				this.model.set("filteredSortedRows", rows);

				return rows.length > 0;
			},

			populateItems: function () {
				var self= this;
				if(!self.$rows) return;
				self.$rows.empty();
				var rows = this.model.get("filteredSortedRows") || [];

				if(!this.options.modal && rows.length == 0 && this.options.hideOnEmpty) {
					this.hideDropdown();//TODO: consider temp hiding; or showing current textbox value if applicable
					return;
				}

				rows.forEach(function(item, idx){
					if(item.selected) item.shouldSelect = true;
					else delete item.shouldSelect;
					var itemText = (item.text || "").replace(/\xA0/g/* removing "real" nbsp char that causes lines not to wrap*/, " ");
					var $itemEl = $('<li data-idx="'+item.idx+'"><div class="text-wrap"><span class="item-text"></span><span class="additional-text"></span></div><i class="fa fa-check checked single-checked"></i><i class="icon-checkbox-selected multiple-checked"></i><i class="icon-checkbox-unselected multiple-unchecked"></li>')
						.toggleClass("selected",!!item.selected)
						.toggleClass("disabled",!!item.disabled)
						.on("click", function(e){
							if(item.disabled) {
								self.trigger("dropdown:disable");
								e.stopPropagation();
								return;
							}
							var selected = (item.shouldSelect === undefined) ? item.selected : item.shouldSelect;
							if(selected && !self.options.multi && !self.options.allowUnselect) return;//Prevent unselect when it is not supported
							if(!self.options.multi) self.model.get("rows").forEach(function(other){other.setSelected && other.setSelected(false);});
							item.setSelected(!selected);
						});
					$(".item-text",$itemEl).text(itemText);
					if(item.additional && item.additional.length > 0){
						var additionalText = item.additional.map(function(a){
							return a.text.replace(/<.*?>/g,"");
						}).join(", ");
						$(".additional-text",$itemEl).text(additionalText);
					}

					if(item.hist){
						$('<i class="fa fa-clock-o history"></i>').appendTo($itemEl);

						/////////////////////////////////////////////
						var swipeAnySide = function() {
							self.model.removeItemFromHist(item);
							delete item.hist;
							delete item.histIdx;
							self.trigger("cache:updated");
							self.filterAndSortRows();
						};

						var dragCallback = function(step, transformProperty) {
							if ($itemEl.hasClass('swiping')) return;
							$itemEl[0].style[transformProperty] = 'translate3d('+step.curX+'px, 0, 0)';
							var dist = Math.abs(step.curX);
							dist = dist > 150 ? 150 : dist;
							var opacity = (dist / 500);
							opacity = opacity < 0.1 ? 0.1 : opacity;
							$itemEl[0].style["background"] = 'rgba(0,0,0,' + opacity + ')';
						};

						var onCancel = function(){
							$itemEl.transition({ x: '0px', background:'transparent' });
							$itemEl.removeClass("deleting-cache");
						};

						var onStart = function(){
							$itemEl.addClass("deleting-cache");
						};

						$itemEl.drag({swipeRight : swipeAnySide,
							swipeLeft : swipeAnySide,
							threshold: 0.5,
							dragCallback: dragCallback,
							onCancel: onCancel,
							onStart: onStart});
						/////////////////////////////////////////////
					}
					item.setSelected = function(state){//TODO: fix when in single select mode and selecting the selected item
						item.shouldSelect = state;
						$itemEl.toggleClass("selected", state);
					};

					self.$rows.append($itemEl);
				});
				if(this.shown) this.positionPopOver();
			},

			fillValue: function(){
				var value = this.model.get("textValue");
				if(this.options.hasInput) {
					if (value === undefined) return; // copied (in a way) from Textbox.js::setText
					var $input = this.getInput(true);
					if (!$input.is(":focus") && $input.val() !== value) $input.val(value); // also copied from Textbox.js::setText
					this.checkEmpty();
				}
				else {
					this.$(".selected-content").text(value);
					this.fillPlaceholderIfNeeded();
				}
			},

			fillPlaceholderIfNeeded:function(){
				if(this.options.hasInput) return;//placeholder handled by the input...
				if(!this.model.get("textValue") && this.model.get("placeholder")) {
					this.$(".selected-content").text(this.model.get("placeholder")).addClass("placeholder-text");
				}
				else{
					this.$(".selected-content").removeClass("placeholder-text");
				}
			},

			//////////////////////////////////////// Visual Rendering


			createItemsEl:function(){
				this.$items = $('<div class="items"><ul class="rows"></ul><div class="loading-data hidden">Loading more choices...</div><button class="dd-save"><i class="fa fa-check"></i></button></div>').toggleClass("multi",this.options.multi);//TODO: dont call options as it is not cached
				this.$rows = this.$items.find(".rows");
				this.$save = this.$items.find(".dd-save");
				this.$loading = this.$items.find(".loading-data");

				this.$items.on("click",function(e){
					e.stopPropagation();
					e.preventDefault();
				});

				return this.$items;
			},

			createPopover:function(){
				this.$popOver = this.renderOutsideEl("popover").addClass("popover-dropdown closed hidden").toggleClass("multi",this.options.multi);

				this.$tipFG = $('<div class="dd-tip-fg"></div>').appendTo(this.$popOver);
				this.createItemsEl().appendTo(this.$popOver);
				this.$tipBG = $('<div class="dd-tip-bg"></div>').appendTo(this.$popOver);

				var self = this;

				this.$popOver.bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e) {
					self.$rows.addClass('active');
					if (e.originalEvent.animationName === 'close') {
						self.$popOver.removeClass("close-bubble");
						self.$popOver.addClass("closed hidden");
						self.$rows.removeClass('active');
					}

				});

				if(this.options.filterable){
					this.getInput(true).on("input",function(){
						clearTimeout(self.filterTimeout);
						self.filterTimeout = setTimeout(function(){
							self.filterAndSortRows();
						},300)
					});
				}

				$(window).on("resize", {control: this}, windowResized);
			},

			createModal:function(){
				var self = this;
				this.$modalOver = this.renderOutsideEl("modal").addClass("modal-dropdown closed hidden").toggleClass("multi",this.options.multi);
				$('<div class="dd-header"><button class="dd-close"><i class="fa fa-times"></i></button></div>').appendTo(this.$modalOver);
				var $header = this.$modalOver.find(".dd-header");

				if(this.options.modalInput){
					this.$modalInput = $('<input>').addClass("dd-input").appendTo($header);
					this.$modalInput.on("keydown", self._onKeyDown.bind(self));
					$('<button class="icon clear"><i class="fa fa-times-circle"></i></button>').appendTo($header).on("click", function() {
						self.$modalInput.val("").focus();
						if(!self.options.model.get("isReadOnly") && !self.options.preventClearTextValueFromModal) {self.model.set("textValue", "");}
						self.trigger("clear:modalinput");
						if(self.options.filterable) {self.filterAndSortRows()}
						return false;
					});
					$header.find(".fa-times").removeClass("fa-times").addClass("fa-chevron-left");
					this.$modalOver.addClass("has-input");

					this._addMaxLengthValidation(this.$modalInput);
				}
				else{
					$('<div>Choose options</div>').addClass("dd-text").appendTo($header);
				}

				if(this.options.filterable){
					this.$modalInput.on("keyup",function(){
						clearTimeout(self.filterTimeout);
						self.filterTimeout = setTimeout(function(){
							self.filterAndSortRows();
						},300)
					});
				}

				this.createItemsEl().appendTo(this.$modalOver);
				this.$save.remove().appendTo($header);

				$header.find(".dd-close").on("click",function(e){
					self.hideDropdown(true);
					self.trigger("modal:close");

					try{
						self.reportInteraction({
							element: "TextBox",
							interaction: "click",
							controlPath: "[data-modal-mc="+self.model.get("id")+"] .dd-close"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Text box close dd interaction");
					}
				})
			},


			//////////////////////////////////////// Show/Hide

			showLoading:function(){
				this.isLoading = true;
				this.$loading && this.$loading.toggleClass("hidden", false);
				this.$el.toggleClass("loading", true);
				this.trigger("loading/show");
			},

			hideLoading:function(){
				this.isLoading = false;
				this.$loading && this.$loading.toggleClass("hidden", true);
				this.$el.toggleClass("loading", false);
				this.trigger("loading/hide");
			},


			showDropdown:function(e1){
				e1 = e1 && e1.originalEvent || e1 || {};
				if(this.shown || this.hiding || e1.justHidden || this.model.get("isDisabled") || (!this.options.showWhenReadOnly && this.model.get("isReadOnly"))) return;

				var self = this;
				var beforeShowArg = {};
				this.trigger("beforeShow", beforeShowArg);
				if(beforeShowArg.cancel) return;

				var hasItems = this.filterAndSortRows(e1);
				if(this.options.hideOnEmpty && !hasItems) return;

				if (this.options.modal || this.options.multi) {
					this.createModal();
				}
				else {
					this.createPopover();
				}
				this.addDropdownEventListeners();
				this.populateItems();
				this.isLoading && this.$loading.toggleClass("hidden", false);

				if(this.$popOver){
					this.$shield = Utils.shieldUp("dd"+this.model.get("id"), true);
					if(Capriza.device.ios){
						//this.getScrollingContainer().on("scroll",this.onScroll);
						this.getClosestScrollingContainer().on("scroll",this.onScroll);
					}
					else if (Capriza.device.android){
						this.getClosestScrollingContainer().css({"overflow-y":"hidden"});
						//this.getScrollingContainer().css({"overflow-y":"hidden"});
					}
					this.$popOver.removeClass("hidden")[0].offsetWidth;
					this.positionPopOver();

					var animationClasses = this.options.hasInput ? '' : ' open-bubble-bounce-start';
					this.$popOver.addClass('active'+animationClasses).removeClass("closed");

					if (!animationClasses /*|| Capriza.device.ie11*/) {
						this.$rows.addClass('active');
					}

					this.$shield.on("click",function(e){
						self.trigger("shield:click", e);
						if(e.dontHide) return;

						try{
							self.reportInteraction({
								element: "TextBox",
								interaction: "click",
								controlPath: ".global-shield.dd"+self.model.get("id")
							});
						} catch(e){
							Logger.info("[UserInteraction] Exception on report Text box close popup interaction");
						}
						self.hideDropdown(true, e);
					});
				}

				if(this.$modalOver){
					function changeClasses(){
						self.$modalOver.removeClass("hidden");
						if(Capriza.device.ios){
							self.getClosestScrollingContainer().on("scroll",self.onScroll);
							//self.getScrollingContainer().on("scroll",self.onScroll);
						}
						else if (Capriza.device.android){
							self.getClosestScrollingContainer().css({"overflow-y":"hidden"});
							//self.getScrollingContainer().css({"overflow-y":"hidden"});
						}
						self.$shield.css({"background":"rgba(0,0,0,0.2)"});
						self.$modalOver.addClass('active').removeClass("closed");
					}
					this.$shield = Utils.shieldUp("dd" + this.model.get("id"), true).css({"background":"rgba(0,0,0,0)","transition":"background-color 0.2s"});
					this.$shield.on("click",function(e){
						self.hideDropdown(true, e);
					});

					if(Capriza.device.isTablet) {
						if(!this.options.modalInput) {
							this.$modalOver.bind('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', function(e) {
								self.$modalOver.removeClass("sliding");
							});
						}
						changeClasses();
					}else{
						changeClasses();
					}

					if(this.$modalInput){
						this.$modalInput.val(this.getInput(true).val());
						this.$modalInput.focus();
					}
				}

				this.shown = true;
				e1.justShown = true;

				//inherited from uiControl, notifies the page that this control now blocks the entire page,
				//until "unblockPage" or "hideBubble" are called
				this.notifyBlockPage();

				this.trigger("dropdown:shown");
			},

			hideDropdown:function(cancel, e1){
				e1 = e1 && e1.originalEvent || e1 || {};
				if(!this.shown || e1.justShown) return;
				this.hiding = true;

				var self = this;

				cancel ? this.trigger("canceling") : this.$(".focusable").focus();
				this.trigger("beforeHide");

				function finishHiding(){
					self.shown = false;
					e1.justHidden = true;
					//notify the page that this dropdown doesn't block it anymore.
					Capriza.Views.UiControl.prototype.unblockPage.apply(self);
					self.trigger("dropdown:hidden");
					self.hiding = false;
				}
				if(this.$popOver){
					Utils.shieldDown("dd"+this.model.get("id"));
					if(Capriza.device.ios){
						this.getClosestScrollingContainer().off("scroll",this.onScroll);
						//this.getScrollingContainer().off("scroll",this.onScroll);
					}
					else if (Capriza.device.android){
						//this.getScrollingContainer().css({"overflow-y":"auto"});
						this.getClosestScrollingContainer().css({"overflow-y":"auto"});
					}

					var animationClasses = this.options.hasInput ? '' : "close-bubble";
					this.$popOver.addClass(animationClasses);
					this.$popOver.removeClass('active');
					this.$popOver.removeClass('open-bubble-bounce-start');

					this.$popOver.bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e) {
						self.removeDropdown();
						finishHiding();
					});

					if (!animationClasses /*|| Capriza.device.ie11*/) {
						self.removeDropdown();
						finishHiding();
					}
				}
				if(this.$modalOver){
					function changeClassesAndRemove(){
						self.$modalOver.addClass("hidden closed");
						self.$modalOver.removeClass('active');
						Utils.shieldDown("dd"+self.model.get("id"));
						if(Capriza.device.ios){
							self.getClosestScrollingContainer().off("scroll",self.onScroll);
							//self.getScrollingContainer().off("scroll",self.onScroll);
						}
						else if (Capriza.device.android){
							self.getClosestScrollingContainer().css({"overflow-y":"auto"});
							//self.getScrollingContainer().css({"overflow-y":"auto"});
						}
						self.removeDropdown();
						finishHiding();
					}
					this.$shield.css({"background":"rgba(0,0,0,0)"});
					if(Capriza.device.isTablet) {
						self.$modalOver.addClass("sliding");
						if(!this.options.modalInput) {
							self.$modalOver.bind('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', function(e) {
								self.$modalOver.removeClass("sliding");
								changeClassesAndRemove();
							});
							self.$modalOver.removeClass('active');
						}
						else{
							changeClassesAndRemove();
						}
					}
					else {
						changeClassesAndRemove();
					}
				}
			},

			toggleDropdown: function(e){
				try{
					this.reportInteraction({
						element: "TextBox",
						interaction: "click"
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report Text box toggle dropdown interaction");
				}
				if(this.shown) {
					this.hideDropdown(true,e)
				} else {
					this.showDropdown(e);
				}
				e.stopPropagation();
			},

			//This method is called from the page, when the page wants to close/clear "blocking" controls
			unblockPage: function(){
				this.hideDropdown(true);
			},

			positionPopOver:function(){
				if(!this.$popOver) return;
				var tipHalfHeight = this.$tipFG.css("border-left-width").replace("px","");
				var tipVisualHeight = tipHalfHeight / 0.71 /* ~sin(45)*/;
				var elRect = (this.$el.find(".opener").length > 0 ? this.$el.find(".opener") : this.$el)[0].getBoundingClientRect();
				var btnRect = (this.$openerButton && this.$openerButton[0] ? this.$openerButton[0].getBoundingClientRect(): elRect);
				var vpRect = $('.viewport')[0].getBoundingClientRect();

				var tipLeftAdjust = 0;
				if(Capriza.device.isTablet){
					var elValueRect = (this.$el.find(".value").length > 0 ? this.$el.find(".value") : this.$el)[0].getBoundingClientRect();
					this.$popOver.css({left: elValueRect.left, right: (vpRect.width - elValueRect.right)});
					tipLeftAdjust = elValueRect.left;
				}

				var tipLeft = btnRect.left - vpRect.left + (btnRect.width/2) - tipLeftAdjust - tipHalfHeight /*height and width are the same*/;
				var bgBorderWidth = 1 * this.$tipBG.css("border-left-width").replace("px","");

				var itemsOverHeight= this.$popOver.find(".items").height();
				//this.$popOver.find(".rows").css({"height":itemsOverHeight});
				var withKeyBoard = document.activeElement && (document.activeElement.tagName=="INPUT" || document.activeElement.tagName=="TEXTAREA"); // #19310 in IE11 activeElement can be null
				var threshold = withKeyBoard ? 0.6 : 1.2;

				if(elRect.top - vpRect.top > (vpRect.bottom - elRect.bottom) * threshold) { //Should open upwards

					// Popover
					var elTop = elRect.top - vpRect.top - itemsOverHeight;// - tipVisualHeight;
					this.$popOver.css('top', elTop);
					this.$popOver.css('transform-origin', (tipLeft +(tipVisualHeight/2)) + "px bottom");
					//this.$popOver.attr('placement', 'bottom-'+animateOrigin);
					// Tip
					var tipTop = itemsOverHeight - tipVisualHeight +1;
					this.$tipFG.css({"left" : tipLeft,"top" : tipTop,"transform":"transform: rotateZ(225deg)"});
					this.$tipBG.css({"left" : tipLeft - bgBorderWidth,"top" : tipTop,"transform":"transform: rotateZ(225deg)"});
				} else {
					// Popover
					//TODO: consider removing the border size itself instead of -1 in case we have a thicker border (should also consider the input border if needed)
					var elBottom = elRect.bottom - vpRect.top -1;// + tipVisualHeight;
					this.$popOver.css('top', elBottom);
					this.$popOver.css('transform-origin', (tipLeft +(tipVisualHeight/2)) + "px top");
					//this.$popOver.attr('placement', 'top-'+animateOrigin);
					// Tip
					this.$tipFG.css({"left" : tipLeft,"top" : -tipHalfHeight,"transform":"transform: rotateZ(45deg)"});
					this.$tipBG.css({"left" : tipLeft - bgBorderWidth,"top" : -tipHalfHeight,"transform":"transform: rotateZ(45deg)"});
				}
			},

			////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////

			getPresentationModel: function () {
				var model = this.model.toJSON(),
				    buttonObj = this.getTextboxButtonObj();

				_.extend(model, {
					uniqueControlId: this.getUniqueControlId(),
					labelId: this.labelId(),
					inputId: this.labelFor(),
					inputType: model.inputType || this.inputType,
					hasIconLabel: !!model.iconLabel,
					textboxIcon: buttonObj.icon,
					ariaLabel: buttonObj.ariaLabel,
					actionClass: buttonObj.actionName,
					buttonDisabled: buttonObj.disable,
					_textboxClass: this.textboxClass,
					isClearButton: this.isClearButton()
				});

				if(this.isDropdownEnabled()) {
					_.extend(model, this.options);

					model.button = model.button || this.isLocation() || this.isBarcode();
					model.hasIconButton = model.opener || model.button;
					model.textValue = model.text || model.valueText || model.placeholder;
				}

				return model;
			},

			getTextboxButtonObj: function() {
				var textboxIcon = this.textboxIcon, ariaLabel = "Clear Text", disable = false, actionName = "";
				if (this.isBarcode()) {
					textboxIcon = "fa fa-qrcode";
					ariaLabel = "Scan with camera";
					disable = !this.enableBarcode();
					actionName = "barcode";
				}
				if (this.isLocation()) {
					textboxIcon = "fa fa-location-arrow";
					ariaLabel = "Locate on Map";
					disable = !this.enableLocation();
					actionName = "location";
				}
				if (this.isSubmittable()) {
					textboxIcon = 'fa fa-chevron-right';
					ariaLabel = "Submit";
				}

				return {
					icon: textboxIcon,
					ariaLabel: ariaLabel,
					disable: disable,
					actionName: actionName
				};
			},

			isBarcode: function() {
				return this.hasExtraData("barcode");
			},

			isLocation: function() {
				return this.hasExtraData("location");
			},

			isSubmittable: function() {
				return this.model.get("isSubmittable");
			},

			isClearButton: function() {
				return this.getTextboxButtonObj().icon === "fa fa-times-circle";
			},

			enableBarcode: function() {
				return this.isBarcode() && Capriza.Capp && Capriza.Capp.barcodeScanner;
			},

			enableLocation: function() {
				return this.isLocation() && !window.isDesignerPreview && !window.designerLoaded;
			},

			getInput:function(real){
				if(!real && this.options.modal && this.options.modalInput){
					return this.$modalInput;
				}

				if (this.model.get("multiline")) {
					return this.$("textarea");
				} else {
					return this.$("input");
				}
			},

			setText: function(text) {
				var $input = this.getInput();

				if (text !== undefined && !$input.is(':focus') && $input.val() !== text) {
					$input.val(text);

					if(this.model.get("multiline")){
						$input.trigger("autosize");
					}
				}

				this.checkEmpty && this.checkEmpty($input);
			},

			getText: function(){
				var $input = this.getInput();
				return $input.val();
			},

			disablePropagation: function() {
				this.$(".value, label").on('click', function(e) {
					e.stopPropagation();
					e.preventDefault();
				})
			},
			checkEmpty: function($input) {
				$input = $input || this.getInput(true);
				if(!$input || $input.val()===undefined) return;//TODO: <<-- fix this hack (to prevent exception when having a filter on a non input DD)
				this.$el.toggleClass("empty", $input.val().length==0);
			},

			setTooltip: function() {
				Capriza.Views.UiControl.prototype.setTooltip.apply(this, arguments);
				if (this.model.get('tooltip')) {
					this.getInput(true).attr('title', this.model.get('tooltip'));
				}

			},

			locationInput:function() {
				function locationSuccess(position) {

					function geocodingSuccess(geocode) {
						logger.log(geocode);
						window.baba = geocode;
						if(geocode.status != "OK"){
							return error();
						}
						var locationType = self.model.get("locationType");
						if (!locationType) {
							locationType = "full_address";
						}
						var address = window.Utils.LocationParser.getLocation(geocode.results, locationType);
						if (!address) {
							if (locationType === "full_address" || locationType === "gps_coordinates") {
								address = lat + "," + lng;
							}
							else {
								address = "";
							}
						}

						try{
							self.reportInteraction({
								element: "TextBox",
								interaction: "click",
								additionalData: "Geo Location",
								value: self.model.get("encrypt") ? "$$Encrypted$$" : address
							});
						} catch(e){
							Logger.info("[UserInteraction] Exception on report Text box geolocation interaction");
						}
						self.model.set("textValue", address);
						self.model.api.setText(address);
						self.fillValue();
						$input.blur();
						Utils.hideLoading();
					}

					var lat=position.coords.latitude;
					var lng=position.coords.longitude;

					var apiRequest=googleReverseGeocodingApi.replace('{lat}',lat);
					apiRequest=apiRequest.replace('{lng}', lng);


					$.ajax({
						url: apiRequest,
						success: geocodingSuccess,
						error:error,
						xhrFields:{
							withCredentials:false
						}
					});
				}

				function error() {
					alert("Couldn't get location, make sure location services are enabled in settings", null, "location disabled");
					logger.error("Getting location error",arguments);
					Utils.hideLoading();
				}

				function getLocation(e){
					Utils.showLoading('Getting your location...');
					try {
						top.navigator.geolocation.getCurrentPosition(locationSuccess, error, {enableHighAccuracy: true, timeout: 5000});
					}
					catch (err) {
						error();
					}
					$input.blur();
				}

				var self = this;
				var googleReverseGeocodingApi="https://maps.google.com/maps/api/geocode/json?latlng={lat},{lng}";
				var $input =this.getInput(true);
				this.$(".location").off("click").on("click", getLocation);
			},
		});


		//////////////////////////////////////// Model Extension
		Capriza.Model.Caching = {};

		Capriza.Model.Caching.initCaching = function(model){
			var cacheKey = model.get("cacheData") && model.get("cacheData").key;
			_.extend(model, Capriza.Model.Caching.Prosthesis);
			Capriza.Model.Caching._cachedControls[model.get("id")] = model;
			if(!cacheKey) return;
			if(!Capriza.Model.Caching._cacheKeys[cacheKey]) {
				Capriza.Model.Caching._cacheKeys[cacheKey] = _.extend({}, Backbone.Events);
				if(!window.appData){
					Dispatcher.once("appData", function() {
						model.triggerHistoryChanged(cacheKey);
					});
				}
			}
			Capriza.Model.Caching._cacheKeys[cacheKey].on("history:change",function(mcId){
				if(model.get("id") == mcId) {
					setTimeout(function(){
						model.refreshRows();
					},251);
				}
				else{
					model.refreshRows();
				}
			});

		};

		Capriza.Model.Caching.refreshAllCachedControls=function(){
			Object.keys(Capriza.Model.Caching._cachedControls).forEach(function(key){
				Capriza.Model.Caching._cachedControls[key].refreshRows();
			})
		};

		Capriza.Model.Caching.Prosthesis = {

			_mergeCache: function(items, cache, union){
				if(!cache) return items;
				var merged = items.map(function(item, idx){
					var cacheItem = _.find(cache,function(ci){
						var found = ci.text == item.text;
						if(found) ci.idx = idx;
						return found;
					});
					return _.extend(item,cacheItem);
				});
				if(union){
					var notMerged = cache.filter(function(ci){
						return !(ci.idx > -1);
					});
					merged = merged.concat(notMerged);
				}
				return merged;
			},

			getItems:function(){
				return [];
			},

			refreshRows:function(){
				var items = this.getItems();
				var cache = Capriza.CacheManager.getHistory(this);
				items = this._mergeCache(items, cache);
				this.set("rows", items);
			},

			saveToCache: function(reason){
				if(!this.get("cacheKey") && !this.get("cacheData")) return;
				var self = this;
				var items = this.getCurrentItemsForCache(reason);
				var additional;

				if(items.length == 1){
					additional = this.getAdditionalValues(reason);
				}

				items.forEach(function(item){
					if(item.text && item.text.trim()){
						if(additional){
							item.additional = additional;
						}
						Capriza.CacheManager.setHistory(self,item);
					}
				});

				if (items.length > 0) {
					Capriza.CacheManager.setPersonalizedRTParam(self, items[items.length - 1].text);
				}

				this.triggerHistoryChanged(this.get("cacheData").key);
			},

			onTextValueChanged: function() {
				Capriza.CacheManager.verifyPersonalizedRTParam(this, this.get("textValue"));
			},

			triggerHistoryChanged: function (key) {
				Capriza.Model.Caching._cacheKeys[key] && Capriza.Model.Caching._cacheKeys[key].trigger("history:change",this.get("id"));
			},

			removeItemFromHist:function(item){
				if(!this.get("cacheKey") && !this.get("cacheData")) return;
				Capriza.CacheManager.removeItemFromHist(this, item.histIdx);
				this.triggerHistoryChanged(this.get("cacheData").key);
			},

			getCurrentItemsForCache:function(){
				return this.get("rows").filter(function(item){
					return item.selected;
				}).map(function(item){
					return {text: item.text}; //No need for selected or index or nothing
				});
			},

			getAdditionalValues: function(){
				var additional;
				if(this.get("cacheSecondaryControls")){
					additional = [];
					this.get("cacheSecondaryControls").forEach(function(mcId){
						var additionalModel = Capriza.Model.Control.getById(mcId);
						var item = additionalModel.getCurrentItemsForCache && additionalModel.getCurrentItemsForCache();
						if(item && item.length > 0 && item[0].text.length > 0) additional.push(_.extend({mcId:mcId},item[0]));
					});
				}
				return additional;
			}
		};

		Capriza.Model.Caching._cachedControls = {};
		Capriza.Model.Caching._cacheKeys = {};

		Capriza.Views.Textbox = Capriza.Views.TextboxBase.extend({

			_post: function() {

				var self = this;
				_.bindAll(this, "onChange", "submit", "onKeyUp", "enableBarcodeWhenReady");
				var $input = this.getInput(true);

				$input.on("keyup", this.onKeyUp);

				// TODO: this should be cleaned up: in TextboxBase._post the addUiEventListeners method is called only if !isDropDownEnabled
				if (!this.isDropdownEnabled()) {
					//$input.on("change", this.onChange);
					this.listenToChange();
					this.on("change",this.onChange);
					this.$(".icon").on("click", _.bind(this.onClearClick, this));
				}

				if (this.enableLocation()) {
					this.locationInput();
				}

				if (this.isSubmittable()) {
					this.setIsSubmittable();
				}

				if (this.isBarcode()) {
					if (this.enableBarcode()){
						this.barcodeScannerInput();
					}
					else {
						Dispatcher.on("capp/pluginready", self.enableBarcodeWhenReady);
						Logger.debug("barcode scanner not ready - waiting for event");
					}
				}

				if (this.model.get("multiline")) {
					$input.css("min-height",50);
					setTimeout(function(){
						$input.autosize();
					},10);

				}

				if (this.model.get("incrementalType")) {
					$input.on("input", function(){
						self.model.api.setText(self.getEventData());
					});
				}

				// This is a fix for bug #21592 - the problem is "-webkit-overflow-scrolling: touch" on the page but we can't remove it.
				// Need to force reflow so that the input will draw the new value.
				// Don't use Capriza.reflow because when typing fast it's change the size of the window.
				if (Capriza.device.ios) {
					$input.on("input", function(){
						var scrollingArea = self.getClosestScrollingContainer();
						if (scrollingArea && scrollingArea.length) {
							var scrollTop = scrollingArea[0].scrollTop;
							scrollingArea[0].scrollTop = 0;
							scrollingArea[0].scrollTop = scrollTop;
						}
					});
				}

				this.checkEmpty( $input ) ;

				this.setIsReadOnly();

				Capriza.Views.TextboxBase.prototype._post.apply(this, arguments);

			},

			enableBarcodeWhenReady: function () {
				if (this.enableBarcode()) {
					Dispatcher.off("capp/pluginready", self.enableBarcodeWhenReady);

					Logger.debug("barcode scanner is ready - capp/pluginready event received");

					this.$el.removeClass("buttonDisabled");
					this.barcodeScannerInput();
				}
			},

			onClearClick: function() {
				var $input = this.getInput(true);
				if (this.model.get("isReadOnly")) return false;
				var orig = $input.val();
				$input.val("");
				if (orig) this.onChange(orig);

				if(this.model.get("multiline")){
					$input.trigger("autosize")
				}

				// TODO (amit): crappy solution for #6791 - did it quickly for BMC
				if ($input.closest(".list,.table").length === 0) {
					$input.focus();
				}

				return false;
			},


			//checkEmpty: function($input) {
			//    this.$el.toggleClass("empty", $input.val().length==0);
			//},

			onChange: function(orig) {
				try{
					var controlPath = "#"+ this.$el.prop("id") + " ." + this.getInput()[0].classList.toString().replace(/\s/g, ".");
					this.reportInteraction({
						element: "TextBox",
						controlPath: controlPath,
						interaction: "val",
						additionalData: "Text Change",
						value: this.model.get("encrypt") ? "$$Encrypted$$" : this.getInput().val()
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report Text box on change interaction");
				}
				if(!this.model.get("incrementalType") || (typeof orig == "string" && orig != this.getInput().val())){
					this.model.api.setText(this.getEventData());
				}
				this.model.set("text", this.getInput().val());
			},
			onKeyUp: function(e) {
				this.checkEmpty(this.getInput()) ;
			},
			getEventData: function() {
				return {
					value: this.getInput().val(),
					encrypt: this.model.get("encrypt")
				};
			},

			setIsSubmittable: function() {
				var self = this, $input = self.getInput();
				this.$("button").off('click').on("click", function(e) {
					e.preventDefault();
					self.submit();
				});
				$input.on("keypress", function(e) {
					if (e.keyCode === 13) {
						e.stopPropagation(); //#21091 call the onChange() manually if value changed, to prevent race condition with 'submit'
						if (self.isTextChanged()) self.trigger('change');
						self.submit();
						self.trigger('enterKeyPressed');
					}
				});
			},

			setIsInForm: function(){
				if (this.isSubmittable()) return;
				var self = this;
				this.getInput().on("keypress", function(e) {
					if (e.keyCode === 13) {
						Logger.debug("[Textbox][setIsInForm] Enter key pressed. triggering change to set the text. triggering 'enterKeyPressed'");
						e.stopPropagation();
						e.preventDefault();
						$(this).blur();
						if (self.isTextChanged()) self.trigger('change');
						self.trigger('enterKeyPressed');
						self.hideDropdown(true, e);
					}
				});
			},

			isTextChanged: function() {
				return this.getInput().val() != this.getText();
			},

			getText: function(){
				return this.model.get("textValue") === undefined ? this.model.get("text") : this.model.get("textValue");
			},

			submit: function() {
				this.model.api.submit();
			},

			barcodeScannerInput: function () {
				var _this=this;
				this.$("button").off('click').on("click", function(e) {
					if(!_this.model.get('isDisabled')) {
						e.preventDefault();
						e.stopPropagation();
						Capriza.Capp.barcodeScanner.scan(function success(result) {
							if (!result.cancelled) {
								_this.setText(result.text);
								_this.model.api.setText(result.text);
							}

						}, function error() {
							navigator.notification.alert("Please try again.", debugCallback, "Scan Failed");
						});
					}
				})

			},

			_types : {
				textbox:{
					opts: {
						hasInput: true,
						modal:false,
						opener:false,
						filterable:true,
						hideOnEmpty:true
					},

					_post:function(){
						Capriza.Views.Textbox.prototype._post.apply(this,arguments);
						var self = this;


						this.model.refreshRows = function(){
							var cache = Capriza.CacheManager.getHistory(this);
							this.set("rows", cache);
							if(!cache || cache.length == 0) self.hideDropdown();
						};

						self.model.refreshRows();

						this.model.on("change:text", function() {
							self.model.set("textValue", self.model.get("text"));
						});
						self.model.set("textValue", self.model.get("text"));

						this.model.getCurrentItemsForCache = function(){
							return [{text:this.get("text")}];
						};

						this.on("selectItems", function(items){
							var val = items.map(function(itm){
								delete itm.selected; //in textbox we don't need selected state.
								return itm.text;
							})[0];
							this.model.api.setText(val);
							this.model.set("text", val);
							if(self.model.get("multiline")){
								this.getInput(true).trigger("autosize");
							}
							this.model.saveToCache();
						});

						this.getInput(true).on("input", function(){
							if(!self.shown && self.filterAndSortRows())
							{
								self.showDropdown();
							}
						});

						this.on("change", function(){
							self.onChange();
							this.model.saveToCache();
						});

						this.on("clear:modalinput", function(){
							this.model.api.setText("");
						});

						this.on("clear:input", function(){
							this.model.set("text", "");
							self.showDropdown();
						});

						this.on("cache:updated",function(){
							self.model.refreshRows();
						});

						this.on("beforeShow", function (e) {
							if (self.model.get("rows").length == 0) {
								e.cancel = true;
							}
						});

						this.on("dropdown:shown",function(){
							self.stopListenToChange();
						});

						this.on("dropdown:hidden",function(){
							self.listenToChange();
						});

						this.on("shield:click", function(e){
							var $btn = self.$("button");
							if($btn[0]) {
								var btnRect = $btn[0].getBoundingClientRect();
								if (btnRect.left < e.clientX && btnRect.right > e.clientX && btnRect.top < e.clientY && btnRect.bottom > e.clientY) {

									if($btn.hasClass("clear")) {
										$btn.click();
										e.dontHide = true;
									}
									else{
										self.changeListener();
										$btn.click();
									}
									return;
								}
							}

							try{
								self.reportInteraction({
									element: "TextBox",
									interaction: "click",
									controlPath: "[data-popover-mc='"+self.model.get("id")+"' .global-shield.active"
								});
							} catch(e){
								Logger.info("[UserInteraction] Exception on report Text box shield click interaction");
							}
							self.changeListener();
						});

						if(this.$clearIcon && !this.$clearIcon[0]){//submittable or location or barcode (should not open dropdown)
							this.$("button").on("click",function(e){
								e.stopPropagation();
							});
						}

					}

				}
			}
		});

		Capriza.Views.Passwordbox = Capriza.Views.Textbox.extend({
			inputType: "password",
			textboxClass: "textbox passwordbox",

			isDropdownEnabled: function(){
				return false;
			}
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Checkbox.js

try{
	;(function() {
		Capriza.Views.Checkbox = Capriza.Views.UiControl.extend({

			initialize: function(){
				this.changedCallbacks = [];
			},

			_render: function() {
				var self = this,
				    uniqueControlId = this.getUniqueControlId();

				this.$el = $(Handlebars.templates['checkbox']({ uniqueControlId: uniqueControlId }));
				this.$el.on("click", function(e) { e.stopPropagation(); });

				this.setChecked(this.getChecked());

				this.$el.on('click', function (e) {
					if (self.model.get("isDisabled")) return;
					self.onChange(!self.getChecked());
				});

				if (Capriza.device.isDesktop) {
					this.$el.on("keypress", function (event) {
						(event.which == 32) && this.click();
						return false;
					});
				}

				return this.$el;
			},

			onChange:  function(checked){
				var self = this, selfArgs = arguments;

				this.$el.toggleClass('checked', checked);
				this.$(".value").focus();
				this.model.set("checked", checked);
				this._onChange(checked);

				this.changedCallbacks.forEach(function(callback){
					callback.apply(self,selfArgs);
				});
			},

			_onChange:  function(checked){
				this.model.api.setChecked(checked);
			},

			regOnChange:function(callback){
				this.changedCallbacks.push(callback);
			},

			setChecked: function(checked) {
				this.$el.toggleClass('checked', !!checked);
			},

			getChecked: function() {
				return this.model.get('checked');
			}
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/LoginCheckbox.js

try{
	;(function() {
		Capriza.Views.LoginCheckbox = Capriza.Views.Checkbox.extend({

			_onChange:function(checked){
				//do nothing (don't send the Engine)
			},

			getReplacedAdditionalValues: function () {
				return {checked: this.getChecked()};
			},

			setReplacedAdditionalValues: function (values) {
				this.onChange(values.checked);
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Datepicker.js

try{
	;(function() {
		// On arrow down, simulates click to open datepicker dialog and sets focus
		// to its first element
		function onKeyDown(event) {
			if (event.which == 40) {
				this.click();

				function focusDialog() {
					var el = $("[role=dialog] [tabindex=0]")[0];

					el.focus();
				}

				setTimeout(focusDialog, 500);
			}
		}

		Capriza.Views.Datepicker = Capriza.Views.HandlebarsUiControl.extend({
			template: "datepicker",

			getPresentationModel: function() {
				var preset=this.model.get("supports");
				var type=preset + "picker";
				var inputType;

				//there is a bug on android 4 devices with the native date picker
				if ( Capriza.device.android  || !Modernizr.inputtypes[preset] || (!Capriza.device.isMobile && Utils.caprizaMode != "ShellMode") || (Capriza.device.ios6 && preset == "datetime")) {
					inputType = "text";
				} else if (Capriza.device.ios) {
					inputType = '';
				} else {
					inputType = preset;
				}

				var icon = this.model.get("iconLabel");
				//icon = icon || (preset === "time" ? "fa fa-clock-o" : "fa fa-calendar");

				var ariaDescription = (preset == "datetime"? "date and time" : preset) + " picker";

				return {
					uniqueControlId: this.getUniqueControlId(),
					inputId: this.labelFor(),
					name: this.model.get("name"),
					inputType:inputType,
					presetType:preset,
					iconLabel: icon,
					ariaDescription: ariaDescription,
					placeholder: this.model.get("placeholder"),
					cssClass:type
				};
			},

			disablePropagation: function() {

				this.$(".value").on('click', function(e) {
					e.stopPropagation();
				})

			},

			_post: function() {
				var self = this,
				    $input = this.$("input"),
				    symbolIcon = this.$("span.icon"),
				    deleteIcon = this.$("button.icon");

				// when finished initialization check which icon will be displayed.
				this.alterIconsVisibility();
				deleteIcon.on("click", function() {
					$input.val("");
					self.saveDateToModel("");
				});

				symbolIcon.on("click", function() {
					$input.focus();
					$input.click();
				});

				self._initWithMobiscroll();
			},

			_destroy: function() {
				this.mobiscrollInst && this.mobiscrollInst.destroy();
			},

			supportedLangs:{
				"de":"de",
				"fr":"fr",
				"sv":"sv"
			},

			_createMobiscrollTimeFormat: function(timeFormat) {
				return timeFormat === "ampm" ? "h:ii A" : "HH:ii";
			},

			_initWithMobiscroll: function() {
				var modelTimeFormat = this.model.get("timeFormat");
				var self = this,
				    $input = this.$("input"),
				    localDate = this.model.get("date") ? this.fromEngineFormatToDate(this.model.get("date")) : undefined,
				    preset = self.getPresentationModel().presetType,
				    zeroMinutes = new Date(),
				    config = window.appData && window.appData.config,
				    dateOrder = (config && config.dateOrder) || undefined,
				    dateFormat = (config && config.dateFormat) || undefined,
				    timeFormat = (preset.indexOf("time") > -1) ? this._createMobiscrollTimeFormat(modelTimeFormat) : undefined,
				    lang = this.supportedLangs[this.model.get("lang")] || (config && config.locale) || undefined;

				if (!dateFormat || !dateOrder) {
					var dateFormatByLocale = window.Utils.DateHelper && window.Utils.DateHelper.getDateFormat();

					if (!dateFormat) {
						dateFormat = dateFormatByLocale ? dateFormatByLocale.toLowerCase() : undefined;
					}

					if (!dateOrder) {
						dateOrder = dateFormatByLocale ? dateFormatByLocale.replace(/[^Mdy]/g, '') : "MMddyy";
					}
				}

				zeroMinutes.setMinutes(0);
				var options={
					theme: Capriza.device.android ? 'android-ics light': 'ios7',
					display: this.isInBubble(this.model.parent) ? 'bottom' : (Capriza.device.isTablet ? "bubble" : Capriza.device.android ? 'modal': 'bottom'),
					mode:'scroller',
					dateOrder: dateOrder,
					dateFormat: dateFormat,
					lang:lang,
					defaultValue: zeroMinutes,
					timeFormat: timeFormat,
					timeWheels: modelTimeFormat === '24hr' ? 'HHii' : undefined,
					context:  Capriza.device.isTablet ? $('.viewport') : (!Capriza.device.isMobile ? $('.viewport') : undefined),
					maxDate: preset != "time" ? new Date((new Date().getFullYear() + 10),12,31) : undefined,
					showOnFocus: false,
					buttons: ['set', 'cancel', 'clear']
				};

				if(Capriza.device.stock){
					options.tap=false; // fixes the problem that the background items are clicked while interacting with the dilog

					/**
					 * adding a dummy function on touchstart fixes the scrolling issue.
					 * ticket #8382.
					 * Happens in stock browsers with Android version < 4.3
					 */
					function stockDateScrollFix(){}

					options.onShow = function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).on('mousedown', stockDateScrollFix);
						});
					};

					options.onClose = function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).off('mousedown', stockDateScrollFix);
						});
					}
				}

				options.onClear = function () {
					if (!Capriza.Views.Datepicker.ignoreEvent) {
						self.saveDateToModel("");
					}
					self.alterIconsVisibility();
				}

				$input.mobiscroll()[preset](options);

				if (Capriza.device.isDesktop) {
					$input.removeAttr("readonly").keydown(onKeyDown);
				}

				self.mobiscrollInst = $input.mobiscroll('getInst');

				if (localDate) {
					$input.scroller('setDate', self.fromUtc(localDate), true);
				}

				this.alterIconsVisibility(); // needed for the drill down

				$input.on("change", function() {
					if (!Capriza.Views.Datepicker.ignoreEvent) {
						self.saveDateToModel(self.toUtc(new Date($input.scroller('getDate'))));
					}
					self.alterIconsVisibility();
				});
			},

			// removed the native timepicker because it caused crashes of the Safari, and stucked the Android.
			/*_initNative: function() {
         var self = this,
         $input = this.$("input");

         if (this.model.get("date")) {
         var value = this.fromEngineFormatToValue(this.model.get("date"));
         $input[0].value = value;
         $input.data("_date", value);
         }

         self.alterIconsVisibility(); // needed for the drill down

         $input.on("blur", function() {
         var orig = $input.data("_date");
         var curr = $input[0].value;

         console.log("input.value:" + $input[0].value);
         console.log("input.value(date): " + new Date($input[0].value));
         console.log("curr: " + curr);
         console.log("curr(json): " + JSON.stringify(curr));
         console.log("orig: " + orig);
         console.log("curr is null? " + (curr === null));
         console.log("curr is undefined? " + (curr === undefined));
         console.log("curr is empty string? " + (curr === ""));
         console.log("typeof curr " + (typeof curr));

         if ( !orig || curr !== orig ) {
         $input.data("_date", curr);
         self.saveDateToModel(self.fromValueToEngineFormat(curr));
         }
         self.alterIconsVisibility();
         });
         },*/

			alterIconsVisibility: function() {
				Logger.trace('this.$("input").val() !== ""' + (this.$("input").val() !== ""));
				Logger.trace('this.$("input") id = ' + this.$("input").attr('id'));
				if (this.$("input").val() !== ""){
					this.$el.addClass('has-content');
				} else {
					this.$el.removeClass('has-content');
				}
			},

			setDate: function(date) {
				this._setDateForMobiscroll(date);
			},

			saveDateToModel: function(date){
				this.model.api.setDate(date);
				this.model.set("date", date);
				Dispatcher.trigger("control/action/end",this);
			},

			_setDateForMobiscroll: function(date) {
				var $input = this.$("input");
				if (date !== "" && date !== null){
					var currValue = $input.scroller('getDate'), newValue = this.fromEngineFormatToDate(date);
					if (!currValue || !this.compareDates(newValue, new Date(currValue))) {
						console.log("updating date on mobiscroll");
						Capriza.Views.Datepicker.ignoreEvent = true;
						$input.scroller('setDate', this.fromUtc(newValue), true);
						Capriza.Views.Datepicker.ignoreEvent = false;
					}
				} else {
					$input.val(""); // this line is necessary for the drill pages
					this.alterIconsVisibility();
				}
			},

			// removed native datepickers. see previous comment
			/*        _setDateNative: function(date) {
         var $input = this.$("input");
         if (date !== "" && date !== null){
         var currValue = $input[0].value;
         if (!currValue || currValue !== this.fromEngineFormatToValue(date)) {
         console.log("updating date on native input");
         $input[0].value = this.fromEngineFormatToValue(date);
         }
         } else {
         $input.val(""); // this line is necessary for the drill pages
         this.alterIconsVisibility();
         }
         },*/

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 * @param str
			 * @returns {Date}
			 */
			fromEngineFormatToDate: function(str) {
				var localDate = new Date(str);
				if (localDate && isNaN(localDate.getTime())) {
					var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(this.model.get("date"));
					localDate = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6]), Number(match[7])));
				}
				return localDate;
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 * @param d1
			 * @param d2
			 * @returns {boolean}
			 */
			compareDates: function(d1, d2) {
				return d1.getUTCMonth() == d2.getUTCMonth() && d1.getUTCDate() == d2.getUTCDate() && d1.getUTCFullYear() == d2.getUTCFullYear()&& d1.getUTCHours() == d2.getUTCHours()&& d1.getUTCMinutes() == d2.getUTCMinutes();
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 *
			 * The engine sends 27/12/2012 10:46am UTC
			 * We need to populate the datepicker with 27/12/2012 10:46am in the user's timezone.
			 * So we interpret the engine's date in UTC, and create a new date in the user's timezone with those values.
			 * @param d
			 * @return {Date}
			 */
			fromUtc: function(d) {
				return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(),d.getUTCMinutes());

			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 *
			 * User picked 27/12/2012 7:00am GMT +0200
			 * We need to send the engine a UTC(GMT) of 27/12/2012 7:00am, which is 27/12/2012 9:00am GMT +0200
			 * So we will always send the engine a date with the offset of the user's timezone
			 * Alternatively, we can just add the timezone offset in minutes
			 *
			 * @param d - user selected date (in the user's timezone)
			 * @return {Date} - offset corrected date (the same values as |d| only in UTC)
			 */
			toUtc: function(d) {
				return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(),d.getMinutes()));

			},

			/**
			 * ##### For Native Implemenetation ####
			 * Recieves value with format of 2013-11-14T08:24:15.318Z and extracts the values from it. No translation is needed here - only string manipulation.
			 * @param engineFormat
			 * @returns {string}
			 */
			fromEngineFormatToValue: function(engineFormat) {
				if (engineFormat === null) return "";

				var preset = this.model.get("supports"),
				    match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(engineFormat),
				    year = match[1],
				    month = match[2],
				    day = match[3],
				    hours = match[4],
				    minutes = match[5];
				if (preset === "date") {
					return year + '-' + month + '-' + day;
				} else if (preset === "datetime") {
					return engineFormat;
				} else if (preset === "time") {
					return hours + ':' + minutes;
				}
			},

			/**
			 * ##### For Native Implemenetation ####
			 *
			 * Each picker type returns a different format from input.value
			 * We want to normalize this to the engine's format, for example:
			 * 1) datepicker: 2013-11-13 ==> 2013-11-13T00:00:00.000Z
			 * 2) datetimepicker: the same value
			 * 3) timepicker: 10:26 ==> 1970-01-01T10:26:00.000Z
			 * @param value
			 * @returns {*}
			 */
			fromValueToEngineFormat: function(value) {
				if (!value) return "";
				var preset = this.model.get("supports");
				if (preset === "date") {
					return value + "T00:00:00.000Z";
				} else if (preset == "datetime") {
					return value;
				} else if (preset === "time") {
					return "1970-01-01T" + value + ":00.000Z";
				}
			}
		});

		function pad(value) {
			return value > 9 ? value : '0' + value;
		}
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Calendar.js

try{
	;(function() {
		Capriza.Views.Calendar = Capriza.Views.HandlebarsUiControl.extend({
			template: "datepicker",

			attributesUpdateOrder: ["minDisplayDate", "maxDisplayDate", "selectedDays", "markedDays", "minDate", "maxDate"],

			mobiOptions: {},
			minDisplayDate: false,
			maxDisplayDate: false,
			$calArea: undefined,
			calInst: undefined,
			selectedDays: [],
			lastLoadedMonth: undefined,

			getPresentationModel: function() {
				var icon = this.model.get("iconLabel");

				return {
					uniqueControlId: this.getUniqueControlId(),
					inputId: this.labelFor(),
					name: this.model.get("name"),
					inputType:"text",
					placeholder:this.model.get("placeholder"),
					iconLabel: icon,
					cssClass: "calendar"
				};
			},

			//TODO: should distroy on CNF
			_destroy: function(){
				//this.$("input").mobiscroll('destroy');
				if(this.calInst) {
					this.calInst.destroy();
				}
			},

			disablePropagation: function() {

				this.$(".value").on('click', function(e) {
					e.stopPropagation();
				})

			},

			_post: function() {
				var self = this,
				    $input = this.$("input"),
				    symbolIcon = this.$("span.icon"),
				    deleteIcon = this.$("button.icon"),
				    preset = "date";

				symbolIcon.addClass(preset);

				// when finished initialization check which icon will be displayed.
				this.alterIconsVisibility();
				deleteIcon.on("click", function() {
					$input.val("");
					self.saveDatesToModel([]);
					self.alterIconsVisibility();
				});

				symbolIcon.on("click", function() {
					$input.focus();
					$input.click();

				});

				self._initMobiscroll();
				if (this.model.get('displayMode') === 'inline') {
					this.$("input").click();
				}

			},

			supportedLangs:{
				"de":"de",
				"fr":"fr",
				"sv":"sv"
			},
			translations:{
				"de":{
					"Legend":"Legende",
					"Calendar":"Kalender"
				}
			},

			_initMobiscroll: function() {
				var defaultMaxDate = new Date();
				defaultMaxDate.setFullYear(defaultMaxDate.getFullYear()+10);
				var self = this,
				    $input = this.$("input"),

				    selectedDays = this.model.get("selectedDays") ? this.model.get("selectedDays") : undefined,
				    selectionMode = this.model.get("selectionMode") ? this.model.get("selectionMode") : {},
				    navigation = this.model.get("displayYear") === false ? 'month':'yearMonth',
				    firstDay = this.model.get("firstWeekDay") > -1 ? this.model.get("firstWeekDay") : 1,
				    minDate  = this.model.get("minDate") ? this.fromEngineFormatToDate(this.model.get("minDate")) : undefined,
				    maxDate  = this.model.get("maxDate") ? this.fromEngineFormatToDate(this.model.get("maxDate")) : defaultMaxDate,
				    weekCounter   = this.model.get("showWeekCounter") ? 'year' : undefined,


				    markTypes = this.model.get("markTypes"),

				    preset = "calendar",
				    config = window.appData && window.appData.config,
				    dateFormat = (config && config.dateFormat) || undefined,
				    lang = this.supportedLangs[this.model.get("lang")] || (config && config.locale) || undefined,
				    $legend,
				    $legendPanel,
				    isLegendVisible = false,
				    $legendButton,
				    onShowEvents = [],
				    onMonthChangeEvents = [],
				    onCloseEvents = [];

				if (!dateFormat) {
					var dateFormatByLocale = window.Utils.DateHelper && window.Utils.DateHelper.getDateFormat();
					dateFormat = dateFormatByLocale ? dateFormatByLocale.toLowerCase() : undefined;
				}

				self.minDisplayDate  = this.model.get("minDisplayDate") ? this.fromUtc(this.fromEngineFormatToDate(this.model.get("minDisplayDate"))) : undefined;
				self.maxDisplayDate  = this.model.get("maxDisplayDate") ? this.fromUtc(this.fromEngineFormatToDate(this.model.get("maxDisplayDate"))) : undefined;
				self.minDate = minDate;
				self.maxDate = maxDate;


				this.mobiOptions={
					theme: Capriza.device.android ? 'android-ics light': 'ios7',
					display: this.isInBubble(this.model.parent) ? 'bottom' : (Capriza.device.isTablet ? "bubble" : Capriza.device.android ? 'modal': 'bottom'),

					navigation: navigation,
					firstDay: firstDay,

					minDate: minDate,
					maxDate: maxDate,

					weekCounter: weekCounter,

					invalid: self._getInitInvalidDays(),
					marked: self._getInitMarkedDays(),
					markedText: false,
					markedDisplay: "bottom",
					dateFormat: dateFormat,
					lang: lang,
					context: !Capriza.device.isMobile ? $('.viewport') : undefined,

					selectType: selectionMode.type ? selectionMode.type :'day',
					multiSelect: selectionMode.type == "multi",
					closeOnSelect: (selectionMode.type != "multi") && selectionMode.closeOnSelect,
					firstSelectDay: selectionMode.selectFromDay,
					showOnFocus: false,

					liveSwipe:!window.isDesignerPreview,//TODO: should disable in desktop ?
					//,showDivergentDays: false
					buttons: ['set', 'cancel', 'clear']
				};

				this.mobiOptions.onClear = function () {
					if (!Capriza.Views.Datepicker.ignoreEvent) {
						self.saveDatesToModel("");
					}
					self.alterIconsVisibility();
				}


				//////////////////////////////////
				//Handle Lazy loading of data "server side month scroll"
				if(self.minDisplayDate || self.maxDisplayDate){

					function loadMonthIfNeeded(year, month, instance){
						var thisMonth = new Date(year, month, 3); // dont use 1st in month to prevent utc time issues
						self.lastLoadedMonth = thisMonth;
						self.saveToPageState("lastLoadedMonth",thisMonth);
						if(self.maxDisplayDate && thisMonth > self.maxDisplayDate){
							self.showCalLoading();
							self.model.api.nextMonth();
						}
						if(self.minDisplayDate && thisMonth < self.minDisplayDate){
							self.showCalLoading();
							self.model.api.prevMonth();
						}
					};
					onMonthChangeEvents.push(loadMonthIfNeeded);

					onMonthChangeEvents.push(self._setOutOfRangeDaysAsInvalid);

					///////////////////////////////////
					// Verify displayed date is in the min/max range
					function onBeforeShow(inst){
						var dateToShow = self._getDateToShow(inst.getDate());
						if(dateToShow){
							inst.navigate(dateToShow);
						}
						self._setOutOfRangeDaysAsInvalid(false, false, inst);
					};
					this.mobiOptions.onBeforeShow = onBeforeShow;

				}

				function _onShow($el, valText, inst) {
					self.saveToPageState("isShown",true);
					self._onDisplayChange();
					self.$calArea= $('div.dwc.dw-cal-c', $el);
					_.each(onShowEvents,function(func){func($el, valText, inst);});
				}
				this.mobiOptions.onShow = _onShow;


				function _onMonthChange(year, month, inst) {
					$(".dw-cal-btn").keyup();//prevent multiple events
					_.each(onMonthChangeEvents,function(func){

						func.apply(self, [year, month, inst]);
					});
					setTimeout(self._onDisplayChange, 1000);
				}
				this.mobiOptions.onMonthChange = _onMonthChange;

				///////////////////////////////////////////////////////////////
				// Init legend if needed.
				if(markTypes && Object.keys(markTypes).length > 0) {

					var types = Object.keys(markTypes);

					$legend = $('<div class="calendar-legend"><div class="calendar-panel"><ul></ul></div></div>');

					var $ul = $('ul',$legend);

					_.each(types, function(key){
						var item = markTypes[key],
						    $li = $('<li><span class="mark-color">&nbsp;</span><span class="mark-text"></span></li>');
						if(item.color){
							$('.mark-color',$li).css({background:item.color});
						}
						if(item.text){
							$('.mark-text',$li).text(item.text);
						}
						$li.appendTo($ul);
					});

					onShowEvents.push(function addLegend($calEl, valText, inst) {
						$('div.dwc.dw-cal-c', $calEl).prepend($legend);
						$legendPanel = $(".calendar-panel", $legend);
						$legendPanel.click(function () {
							_toggleLegend();
						});
					});


					//Only load translation if the mobiscrollLangPack extensions was enabled and a translation to the current lang is available
					var translation = self.mobiOptions.lang && $.mobiscroll.i18n[self.mobiOptions.lang] && self.translations[self.mobiOptions.lang] && self.translations[self.mobiOptions.lang];
					var calendarText = translation && translation["Calendar"] || "Calendar";
					var legendText = translation && translation["Legend"] || "Legend";

					function _toggleLegend() {
						isLegendVisible = !isLegendVisible;

						if(!$legendButton && $(this).hasClass('dwb')){
							$legendButton = $(this);
						}
						if(isLegendVisible){
							$legendButton.text(calendarText);
						} else {
							$legendButton.text(legendText);
						}
						//$legendButton.toggleClass("legend-is-open", isLegendVisible);
						$legend.toggleClass("calendar-legend-visible", isLegendVisible);
					};

					this.mobiOptions.buttons = [
						'set',
						{ text: legendText, handler: _toggleLegend },
						'cancel',
						'clear'
					];

					onCloseEvents.push(function hideLegend(){
						isLegendVisible && _toggleLegend();
						$legendButton = undefined;

					})
				}


				function _onClose() {
					self.saveToPageState("isShown",false);
					_.each(onCloseEvents,function(func){
						func.apply(self);
					});
				};

				this.mobiOptions.onClose = _onClose;


				if(Capriza.device.stock){
					this.mobiOptions.tap=false; // fixes the problem that the background items are clicked while interacting with the dilog

					/**
					 * adding a dummy function on touchstart fixes the scrolling issue.
					 * ticket #8382.
					 * Happens in stock browsers with Android version < 4.3
					 */
					function stockDateScrollFix(){}

					onShowEvents.push(function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).on('mousedown', stockDateScrollFix);
						});
					});

					this.mobiOptions.onClose = function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).off('mousedown', stockDateScrollFix);
						});
					}
				}


				///////////////////////////////////////////////////////////////
				// Init the mobiscroll itself
				$input.mobiscroll().calendar(this.mobiOptions);
				self.calInst = $input.mobiscroll('getInst');
				//////////////////////////////////////////////////////////////
				// Set preselected day(s) or clear if none
				if (selectedDays && selectedDays.length > 0) {
					self._setDatesForMobiscroll(selectedDays);
					if($input.val() == ""){ //this is due to mobiscroll bug where the input is not populated in some cases  (like today) when initialized
						$input.val(this.calInst.val)
					}
				}

				//self.saveToPageState("lastLoadedMonth",thisMonth);
				if(self.loadFromPageState("lastLoadedMonth")){
					self.lastLoadedMonth = self.loadFromPageState("lastLoadedMonth");
				}

				this.alterIconsVisibility(); // needed for the drill down

				$input.on("change", function() {
					if (!Capriza.Views.Calendar.ignoreEvent) {
						var calValues = self._getMobiscrollValues(),
						    values = _.map(calValues,function(value, key){
							    return self.toUtc(new Date(value));
						    });

						self.saveDatesToModel(values);
					}
					self.alterIconsVisibility();
				}).on("click",function(e){
					e.stopPropagation();
					e.preventDefault();
				});

				if(self.loadFromPageState("isShown")){
					self.calInst.show(true);
				}

			},

			showCalLoading: function(){
				var $loading = $('<div class="calendar-screen-block"></div>'), self = this;
				$loading.css(
					{
						width: "100%",
						height: "100%",
						position: "absolute",
						top: 0,
						left: 0,
						background: "rgba(0,0,0,0.5)",
						"z-index":900
					}
				).click(function(){
					//this.remove()
				});
				if(self.$calArea) self.$calArea.prepend($loading);
			},

			_onDisplayChange: function(){
				return false;
			},

			_getDateToShow: function(date){
				if(this.maxDisplayDate && this.lastLoadedMonth < this.maxDisplayDate && this.minDisplayDate && this.lastLoadedMonth > this.minDisplayDate) return this.lastLoadedMonth;//Already was between range limits
				var thisMonth = date || new Date();
				if(this.maxDisplayDate && thisMonth > this.maxDisplayDate){
					return this.maxDisplayDate;
				}
				if(this.minDisplayDate && thisMonth < this.minDisplayDate){
					return this.minDisplayDate;
				}
				return false;
			},

			_removeAllSelectedValues: function(){
				var currSelected = this._getMobiscrollValues(),
				    self = this;

				if(self.calInst) {
					_.each(currSelected, function (val) {
						self.calInst.removeValue(val);
					});
				}
			},

			_getInitInvalidDays: function () {
				var self = this,
				    invalidDays = this.model.get("invalidDays"),
				    ret = undefined;

				if(invalidDays){
					ret = [];
					_.each(invalidDays,function(item){
						if(item.length == 2){
							ret.push(item);
						}
						if(item.length == 24){
							ret.push(self.fromUtc(self.fromEngineFormatToDate(item)));
						}
					});
				}

				return ret;
			},

			_getInitMarkedDays : function(mkdDays){
				var self = this,
				    markedDays = mkdDays || this.model.get("markedDays"),
				    markTypes = this.model.get("markTypes"),
				    ret = undefined,
				    defaultColor = "#ccc";

				if(markedDays){
					ret = [];
					_.each(markedDays,function(item){
						var type = markTypes[item.type];
						if(!item.data) item.data = {};

						var mark = {
							d: self.fromUtc(self.fromEngineFormatToDate(item.day)),
							color: item.data.color ? item.data.color : (type && type.color ? type.color : defaultColor),
							text : item.data.text ? item.data.text : (type && type.text ? type.text : undefined),
							icon : item.data.icon ? item.data.icon : (type && type.icon ? type.icon : undefined)//TODO: CHeck if it works with our already used fontawesome
						};
						ret.push(mark);
					});

				}
				return ret;
			},
			alterIconsVisibility: function() {
				Logger.trace('this.$("input").val() !== ""' + (this.$("input").val() !== ""));
				Logger.trace('this.$("input") id = ' + this.$("input").attr('id'));
				if (this.$("input").val() !== ""){
					this.$el.addClass('has-content');
				} else {
					this.$el.removeClass('has-content');
				}
			},

			saveDatesToModel: function(dates){
				var self = this;
				if(this.maxDisplayDate || this.minDisplayDate) {
					dates = _.filter(dates, function (d) {
						//check if the date is in the range (if a range side is specified)
						return (self.minDisplayDate ? d >= self.minDisplayDate : true ) && (self.maxDisplayDate ? d <= self.maxDisplayDate : true);
					});
				}
				if(dates[0]) {this.lastLoadedMonth = dates[0]; self.saveToPageState("lastLoadedMonth",dates[0]);}
				this.model.api.setDates(dates);
			},


			_getMobiscrollValues: function () {
				//TODO find why  $input.mobiscroll('getValues') does not work sometimes...
				return this._shouldUseMultiAPI() ? this.calInst.getValues() : [this.calInst.getDate()];
			},

			_setDatesForMobiscroll: function(dates) {
				var self = this, $input = this.$("input");
				if (dates && dates.length > 0){
					var currValues = this._getMobiscrollValues($input), newValues = this.arrayFromUtc(this.fromEngineFormatToDateArray(dates));
					if (!currValues || !this.compareDatesArrays(newValues,currValues)) {
						self.selectedDays = newValues;
						console.log("updating date on mobiscroll");
						Capriza.Views.Calendar.ignoreEvent = true;
						if(this._shouldUseMultiAPI()){
							$input.mobiscroll('setValues', newValues, true);
						} else{
							$input.mobiscroll('setDate', newValues[0], true);
						}

						Capriza.Views.Calendar.ignoreEvent = false;
					}
				} else {
					this._removeAllSelectedValues();
					$input.val(""); // this line is necessary for the drill pages
					this.alterIconsVisibility();
				}
			},


			_shouldUseMultiAPI: function(){
				//TODO: open defect to mobi why getValues is not working in 'day' mode
				return this.mobiOptions.multi || this.mobiOptions.selectType == 'week';
			},



			_verifyMinMax: function(){
				var lastLoadedMonth = this.loadFromPageState("lastLoadedMonth");
				if(lastLoadedMonth
					&& this.minDisplayDate && this.minDisplayDate < lastLoadedMonth
					&& this.maxDisplayDate && this.maxDisplayDate > lastLoadedMonth){
					this.lastLoadedMonth = lastLoadedMonth;
					this.calInst.navigate(this.lastLoadedMonth);
					this.saveToPageState("lastLoadedMonth",undefined);
				}
			},

			_setOutOfRangeDaysAsInvalid: function(year, month, instance){
				var invalidDays = this._getInitInvalidDays() || [];
				for(var i = 1;i < 16;i++){
					if(this.maxDisplayDate){
						var maxInc = new Date(this.maxDisplayDate.toISOString());
						maxInc.setDate(maxInc.getDate() + i);
						invalidDays.push(maxInc);
					}
					if(this.minDisplayDate) {
						var minDec = new Date(this.minDisplayDate.toISOString());
						minDec.setDate(minDec.getDate() - i);
						invalidDays.push(minDec);
					}
				}
				instance.settings.invalid = invalidDays;
				instance.refresh();
			},

			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Setters

			setMinDisplayDate:function(minDisplayDate){
				var mdd = this.fromUtc(this.fromEngineFormatToDate(minDisplayDate));
				if(mdd == this.minDisplayDate) return;
				this.minDisplayDate = mdd;
				if(this.$calArea) $(".calendar-screen-block",this.$calArea).remove();
				this._verifyMinMax();
				this._setOutOfRangeDaysAsInvalid(false,false,this.calInst);
			},
			setMaxDisplayDate:function(maxDisplayDate){
				var mdd = this.fromUtc(this.fromEngineFormatToDate(maxDisplayDate));
				if(mdd == this.maxDisplayDate) return;
				this.maxDisplayDate = mdd;
				if(this.$calArea) $(".calendar-screen-block",this.$calArea).remove();
				this._verifyMinMax();
				this._setOutOfRangeDaysAsInvalid(false,false,this.calInst);
			},

			setMarkedDays:function(markedDays){
				if (this.calInst && this.calInst.settings) {
					this.calInst.settings.marked = this._getInitMarkedDays(markedDays);
					this.calInst.refresh();
				}
			},
			setSelectedDays: function(selDays){
				this.selectedDays = selDays;
				this._setDatesForMobiscroll(selDays);
				return;
//
//            var $input = this.$("input"),
//                selectedDays=this.fromEngineFormatToDateArray(selDays);
//            if (selectedDays && selectedDays.length > 0) {
//                this.calInst.setDate(this.fromUtc(selectedDays[0]), true);
//                if(this._shouldUseMultiAPI()) {
//                    this.calInst.setValues(this.arrayFromUtc(selectedDays), true);
//                }
//            }
//            else{
//                this._removeAllSelectedValues();
//            }
			},

			setMinDate:function(minDateStr){
				var minDate = this.fromUtc(this.fromEngineFormatToDate(minDateStr));
				var isVis = this.calInst.isVisible();
				this.mobiOptions.minDate = minDate;
				this.calInst.option('minDate', minDate);
//            this.calInst.refresh();
				isVis && this.calInst.show(true);
			},

			setMaxDate:function(maxDateStr){
				var maxDate = this.fromUtc(this.fromEngineFormatToDate(maxDateStr));
				var isVis = this.calInst.isVisible();
				this.mobiOptions.maxDate = maxDate;
				this.calInst.option('maxDate', maxDate);
//            this.calInst.refresh();
				isVis && this.calInst.show(true);
			},




			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Helpers



			sortDates: function(dates){
				return dates.sort(function(a,b){
					return a > b ? 1 : b > a ? -1 : 0;
				})
			},

			fromEngineFormatToDateArray : function(dates){
				var self = this;
				return _.map(dates,function(value){
					return self.fromEngineFormatToDate(value);
				});
			},


			/**
			 * ##### For Mobiscroll Implemenetation ####
			 * @param str
			 * @returns {Date}
			 */
			fromEngineFormatToDate: function(str) {
				var localDate = new Date(str);
				if (localDate && isNaN(localDate.getTime())) {
					var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(this.model.get("date"));
					localDate = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6]), Number(match[7])));
				}
				return localDate;
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 * @param d1
			 * @param d2
			 * @returns {boolean}
			 */
			compareDates: function(d1, d2) {
				return d1.getUTCMonth() == d2.getUTCMonth() && d1.getUTCDate() == d2.getUTCDate() && d1.getUTCFullYear() == d2.getUTCFullYear()&& d1.getUTCHours() == d2.getUTCHours()&& d1.getUTCMinutes() == d2.getUTCMinutes();
			},

			compareDatesArrays: function(ds1, ds2){
				if(ds1.length != ds2.length){
					return false
				}
				ds1 = this.sortDates(ds1);
				ds2 = this.sortDates(ds2);

				for(var i=0 , l=ds1.length ; i<l ; i++){
					if(!ds1[i] || !ds2[i] || !this.compareDates(ds1[i],ds2[i])){
						return false
					}
				}
				return true;
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 *
			 * The engine sends 27/12/2012 10:46am UTC
			 * We need to populate the datepicker with 27/12/2012 10:46am in the user's timezone.
			 * So we interpret the engine's date in UTC, and create a new date in the user's timezone with those values.
			 * @param d
			 * @return {Date}
			 */
			fromUtc: function(d) {
				return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(),d.getUTCMinutes());

			},

			arrayFromUtc:function(dates){
				var self = this;
				return _.map(dates,function(d){return self.fromUtc(d)});
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 *
			 * User picked 27/12/2012 7:00am GMT +0200
			 * We need to send the engine a UTC(GMT) of 27/12/2012 7:00am, which is 27/12/2012 9:00am GMT +0200
			 * So we will always send the engine a date with the offset of the user's timezone
			 * Alternatively, we can just add the timezone offset in minutes
			 *
			 * @param d - user selected date (in the user's timezone)
			 * @return {Date} - offset corrected date (the same values as |d| only in UTC)
			 */
			toUtc: function(d) {
				return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(),d.getMinutes()));

			},

			arrayToUtc:function(dates){
				var self = this;
				return _.map(dates,function(d){return self.toUtc(d)});
			},

			/**
			 * ##### For Native Implemenetation ####
			 * Recieves value with format of 2013-11-14T08:24:15.318Z and extracts the values from it. No translation is needed here - only string manipulation.
			 * @param engineFormat
			 * @returns {string}
			 */
			fromEngineFormatToValue: function(engineFormat) {
				if (engineFormat === null) return "";

				var type = this.model.get("type").replace("picker", ""),
				    match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(engineFormat),
				    year = match[1],
				    month = match[2],
				    day = match[3],
				    hours = match[4],
				    minutes = match[5];
				if (type === "date") {
					return year + '-' + month + '-' + day;
				} else if (type === "datetime") {
					return engineFormat;
				} else if (type === "time") {
					return hours + ':' + minutes;
				}
			},

			/**
			 * ##### For Native Implemenetation ####
			 *
			 * Each picker type returns a different format from input.value
			 * We want to normalize this to the engine's format, for example:
			 * 1) datepicker: 2013-11-13 ==> 2013-11-13T00:00:00.000Z
			 * 2) datetimepicker: the same value
			 * 3) timepicker: 10:26 ==> 1970-01-01T10:26:00.000Z
			 * @param value
			 * @returns {*}
			 */
			fromValueToEngineFormat: function(value) {
				if (!value) return "";
				var type = this.model.get("type").replace("picker", "");
				if (type === "date") {
					return value + "T00:00:00.000Z";
				} else if (type == "datetime") {
					return value;
				} else if (type === "time") {
					return "1970-01-01T" + value + ":00.000Z";
				}
			}
		});

		function pad(value) {
			return value > 9 ? value : '0' + value;
		}
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/BaseDateCalendarView.js

try{
	(function() {
		Capriza.Views.BaseDateCalendarView = Capriza.Views.HandlebarsUiControl.extend({
			supportedLangs:{
				"de":"de",
				"fr":"fr",
				"sv":"sv"
			},

			_destroy: function(){
				throw new Error("baseDateCalendarView is abstract, extending views must implement _destroy");
			},

			_post: function() {
				throw new Error("baseDateCalendarView is abstract, extending views must implement _post");
			},

			_initWithMobiscroll: function() {
				throw new Error("baseDateCalendarView is abstract, extending views must implement _initWithMobiscroll");
			},

			disablePropagation: function() {
				this.$(".value").on('click', function(e) {
					e.stopPropagation();
				})
			},

			alterIconsVisibility: function() {
				Logger.trace('this.$("input").val() !== ""' + (this.$("input").val() !== ""));
				Logger.trace('this.$("input") id = ' + this.$("input").attr('id'));
				if (this.$("input").val() !== ""){
					this.$el.addClass('has-content');
				} else {
					this.$el.removeClass('has-content');
				}
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 * @param d1
			 * @param d2
			 * @returns {boolean}
			 */
			compareDates: function(d1, d2) {
				return d1.getUTCMonth() == d2.getUTCMonth() && d1.getUTCDate() == d2.getUTCDate() && d1.getUTCFullYear() == d2.getUTCFullYear()&& d1.getUTCHours() == d2.getUTCHours()&& d1.getUTCMinutes() == d2.getUTCMinutes();
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 *
			 * The engine sends 27/12/2012 10:46am UTC
			 * We need to populate the datepicker with 27/12/2012 10:46am in the user's timezone.
			 * So we interpret the engine's date in UTC, and create a new date in the user's timezone with those values.
			 * @param d
			 * @return {Date}
			 */
			fromUtc: function(d) {
				return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(),d.getUTCMinutes());

			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 *
			 * User picked 27/12/2012 7:00am GMT +0200
			 * We need to send the engine a UTC(GMT) of 27/12/2012 7:00am, which is 27/12/2012 9:00am GMT +0200
			 * So we will always send the engine a date with the offset of the user's timezone
			 * Alternatively, we can just add the timezone offset in minutes
			 *
			 * @param d - user selected date (in the user's timezone)
			 * @return {Date} - offset corrected date (the same values as |d| only in UTC)
			 */
			toUtc: function(d) {
				return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(),d.getMinutes()));

			},

			/**
			 * ##### For Native Implemenetation ####
			 *
			 * Each picker type returns a different format from input.value
			 * We want to normalize this to the engine's format, for example:
			 * 1) datepicker: 2013-11-13 ==> 2013-11-13T00:00:00.000Z
			 * 2) datetimepicker: the same value
			 * 3) timepicker: 10:26 ==> 1970-01-01T10:26:00.000Z
			 * @param value
			 * @returns {*}
			 */
			fromValueToEngineFormat: function(value) {
				if (!value) return "";
				var type = this.model.get("type").replace("picker", "");
				if (type === "date") {
					return value + "T00:00:00.000Z";
				} else if (type == "datetime") {
					return value;
				} else if (type === "time") {
					return "1970-01-01T" + value + ":00.000Z";
				}
			},

			/**
			 * ##### For Native Implemenetation ####
			 * Recieves value with format of 2013-11-14T08:24:15.318Z and extracts the values from it. No translation is needed here - only string manipulation.
			 * @param engineFormat
			 * @returns {string}
			 */
			fromEngineFormatToValue: function(engineFormat) {
				if (engineFormat === null) return "";

				var type = this.model.get("type").replace("picker", ""),
				    match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(engineFormat),
				    year = match[1],
				    month = match[2],
				    day = match[3],
				    hours = match[4],
				    minutes = match[5];
				if (type === "date") {
					return year + '-' + month + '-' + day;
				} else if (type === "datetime") {
					return engineFormat;
				} else if (type === "time") {
					return hours + ':' + minutes;
				}
			},

			/**
			 * ##### For Mobiscroll Implemenetation ####
			 * @param str
			 * @returns {Date}
			 */
			fromEngineFormatToDate: function(str) {
				var localDate = new Date(str);
				if (localDate && isNaN(localDate.getTime())) {
					var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(this.model.get("date"));
					localDate = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6]), Number(match[7])));
				}
				return localDate;
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/AbstractDatePicker.js

try{
	(function() {
		// On arrow down, simulates click to open datepicker dialog and sets focus
		// to its first element
		function onKeyDown(event) {
			if (event.which == 40) {
				this.click();

				function focusDialog() {
					var el = $("[role=dialog] [tabindex=0]")[0];

					el.focus();
				}

				setTimeout(focusDialog, 500);
			}
		}

		Capriza.Views.AbstractDatePicker = Capriza.Views.BaseDateCalendarView.extend({

			getPresentationModel: function() {
				var preset=this.model.get("supports");
				var type=preset + "picker";
				var inputType;

				//there is a bug on android 4 devices with the native date picker
				if ( Capriza.device.android  || !Modernizr.inputtypes[preset] || (!Capriza.device.isMobile && Utils.caprizaMode != "ShellMode") || (Capriza.device.ios6 && preset == "datetime")) {
					inputType = "text";
				} else if (Capriza.device.ios) {
					inputType = '';
				} else {
					inputType = preset;
				}

				var icon = this.model.get("iconLabel");
				//icon = icon || (preset === "time" ? "fa fa-clock-o" : "fa fa-calendar");

				var ariaDescription = (preset == "datetime"? "date and time" : preset) + " picker";

				return {
					uniqueControlId: this.getUniqueControlId(),
					inputId: this.labelFor(),
					name: this.model.get("name"),
					inputType:inputType,
					presetType:preset,
					iconLabel: icon,
					ariaDescription: ariaDescription,
					placeholder: this.model.get("placeholder"),
					cssClass:type
				};
			},

			_post: function() {
				error("trying to render abstract DatePicker");
			},

			_destroy: function() {
				this.mobiscrollInst && this.mobiscrollInst.destroy();
			},

			_createMobiscrollTimeFormat: function(timeFormat) {
				return timeFormat === "ampm" ? "h:ii A" : "HH:ii";
			},

			_initWithMobiscroll: function() {
				var modelTimeFormat = this.model.get("timeFormat");
				var self = this,
				    $input = this.$("input"),
				    localDate = this.model.get("date") ? this.fromEngineFormatToDate(this.model.get("date")) : undefined,
				    preset = self.getPresentationModel().presetType,
				    zeroMinutes = new Date(),
				    config = window.appData && window.appData.config,
				    dateOrder = (config && config.dateOrder) || undefined,
				    dateFormat = (config && config.dateFormat) || undefined,
				    timeFormat = (preset.indexOf("time") > -1) ? this._createMobiscrollTimeFormat(modelTimeFormat) : undefined,
				    lang = this.supportedLangs[this.model.get("lang")] || (config && config.locale) || undefined;

				if (!dateFormat || !dateOrder) {
					var dateFormatByLocale = window.Utils.DateHelper && window.Utils.DateHelper.getDateFormat();

					if (!dateFormat) {
						dateFormat = dateFormatByLocale ? dateFormatByLocale.toLowerCase() : undefined;
					}

					if (!dateOrder) {
						dateOrder = dateFormatByLocale ? dateFormatByLocale.replace(/[^Mdy]/g, '') : "MMddyy";
					}
				}

				zeroMinutes.setMinutes(0);
				var options={
					theme: Capriza.device.android ? 'android-ics light': 'ios7',
					display: this.isInBubble(this.model.parent) ? 'bottom' : (Capriza.device.isTablet ? "bubble" : Capriza.device.android ? 'modal': 'bottom'),
					mode:'scroller',
					dateOrder: dateOrder,
					dateFormat: dateFormat,
					lang:lang,
					defaultValue: zeroMinutes,
					timeFormat: timeFormat,
					timeWheels: modelTimeFormat === '24hr' ? 'HHii' : undefined,
					context:  Capriza.device.isTablet ? $('.viewport') : (!Capriza.device.isMobile ? $('.viewport') : undefined),
					maxDate: preset != "time" ? new Date((new Date().getFullYear() + 10),12,31) : undefined,
					showOnFocus: false,
					buttons: ['set', 'cancel', 'clear']
				};

				if(Capriza.device.stock){
					options.tap=false; // fixes the problem that the background items are clicked while interacting with the dilog

					/**
					 * adding a dummy function on touchstart fixes the scrolling issue.
					 * ticket #8382.
					 * Happens in stock browsers with Android version < 4.3
					 */
					function stockDateScrollFix(){}

					options.onShow = function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).on('mousedown', stockDateScrollFix);
						});
					};

					options.onClose = function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).off('mousedown', stockDateScrollFix);
						});
					}
				}

				options.onClear = function () {
					if (!Capriza.Views.Datepicker.ignoreEvent) {
						self.saveDateToModel("");
					}
					self.alterIconsVisibility();
				}

				$input.mobiscroll()[preset](options);

				if (Capriza.device.isDesktop) {
					$input.removeAttr("readonly").keydown(onKeyDown);
				}

				self.mobiscrollInst = $input.mobiscroll('getInst');

				if (localDate) {
					$input.scroller('setDate', self.fromUtc(localDate), true);
				}

				this.alterIconsVisibility(); // needed for the drill down

				$input.on("change", function() {
					if (!Capriza.Views.Datepicker.ignoreEvent) {
						self.saveDateToModel(self.toUtc(new Date($input.scroller('getDate'))));
					}
					self.alterIconsVisibility();
				});
			},

			setDate: function(date) {
				this._setDateForMobiscroll(date);
			},

			saveDateToModel: function(date){
				this.model.api.setDate(date);
				this.model.set("date", date);
				Dispatcher.trigger("control/action/end",this);
			},

			_setDateForMobiscroll: function(date) {
				var $input = this.$("input");
				if (date !== "" && date !== null){
					var currValue = $input.scroller('getDate'), newValue = this.fromEngineFormatToDate(date);
					if (!currValue || !this.compareDates(newValue, new Date(currValue))) {
						console.log("updating date on mobiscroll");
						Capriza.Views.Datepicker.ignoreEvent = true;
						$input.scroller('setDate', this.fromUtc(newValue), true);
						Capriza.Views.Datepicker.ignoreEvent = false;
					}
				} else {
					$input.val(""); // this line is necessary for the drill pages
					this.alterIconsVisibility();
				}
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/AbstractCalendar.js

try{
	;(function() {
		Capriza.Views.AbstractCalendar = Capriza.Views.BaseDateCalendarView.extend({
			attributesUpdateOrder: ["minDisplayDate", "maxDisplayDate", "selectedDays", "markedDays", "minDate", "maxDate"],

			mobiOptions: {},
			minDisplayDate: false,
			maxDisplayDate: false,
			$calArea: undefined,
			calInst: undefined,
			selectedDays: [],
			lastLoadedMonth: undefined,

			getPresentationModel: function() {
				var icon = this.model.get("iconLabel");

				return {
					uniqueControlId: this.getUniqueControlId(),
					inputId: this.labelFor(),
					name: this.model.get("name"),
					inputType:"text",
					placeholder:this.model.get("placeholder"),
					iconLabel: icon,
					cssClass: "calendar"
				};
			},

			//TODO: should distroy on CNF
			_destroy: function(){
				//this.$("input").mobiscroll('destroy');
				if(this.calInst) {
					this.calInst.destroy();
				}
			},

			_post: function() {
				symbolIcon.addClass("date");

				// when finished initialization check which icon will be displayed.
				this.alterIconsVisibility();
				deleteIcon.on("click", function() {
					$input.val("");
					self.saveDatesToModel([]);
					self.alterIconsVisibility();
				});

				symbolIcon.on("click", function() {
					$input.focus();
					$input.click();

				});

				self._initWithMobiscroll();
				if (this.model.get('displayMode') === 'inline') {
					this.$("input").click();
				}

			},

			translations:{
				"de":{
					"Legend":"Legende",
					"Calendar":"Kalender"
				}
			},

			_initWithMobiscroll: function() {
				var defaultMaxDate = new Date();
				defaultMaxDate.setFullYear(defaultMaxDate.getFullYear()+10);
				var self = this,
				    $input = this.$("input"),

				    selectedDays = this.model.get("selectedDays") ? this.model.get("selectedDays") : undefined,
				    selectionMode = this.model.get("selectionMode") ? this.model.get("selectionMode") : {},
				    navigation = this.model.get("displayYear") === false ? 'month':'yearMonth',
				    firstDay = this.model.get("firstWeekDay") > -1 ? this.model.get("firstWeekDay") : 1,
				    minDate  = this.model.get("minDate") ? this.fromEngineFormatToDate(this.model.get("minDate")) : undefined,
				    maxDate  = this.model.get("maxDate") ? this.fromEngineFormatToDate(this.model.get("maxDate")) : defaultMaxDate,
				    weekCounter   = this.model.get("showWeekCounter") ? 'year' : undefined,


				    markTypes = this.model.get("markTypes"),

				    preset = "calendar",
				    config = window.appData && window.appData.config,
				    dateFormat = (config && config.dateFormat) || undefined,
				    lang = this.supportedLangs[this.model.get("lang")] || (config && config.locale) || undefined,
				    $legend,
				    $legendPanel,
				    isLegendVisible = false,
				    $legendButton,
				    onShowEvents = [],
				    onMonthChangeEvents = [],
				    onCloseEvents = [];

				if (!dateFormat) {
					var dateFormatByLocale = window.Utils.DateHelper && window.Utils.DateHelper.getDateFormat();
					dateFormat = dateFormatByLocale ? dateFormatByLocale.toLowerCase() : undefined;
				}

				self.minDisplayDate  = this.model.get("minDisplayDate") ? this.fromUtc(this.fromEngineFormatToDate(this.model.get("minDisplayDate"))) : undefined;
				self.maxDisplayDate  = this.model.get("maxDisplayDate") ? this.fromUtc(this.fromEngineFormatToDate(this.model.get("maxDisplayDate"))) : undefined;
				self.minDate = minDate;
				self.maxDate = maxDate;


				this.mobiOptions={
					theme: Capriza.device.android ? 'android-ics light': 'ios7',
					display: this.isInBubble(this.model.parent) ? 'bottom' : (Capriza.device.isTablet ? "bubble" : Capriza.device.android ? 'modal': 'bottom'),

					navigation: navigation,
					firstDay: firstDay,

					minDate: minDate,
					maxDate: maxDate,

					weekCounter: weekCounter,

					invalid: self._getInitInvalidDays(),
					marked: self._getInitMarkedDays(),
					markedText: false,
					markedDisplay: "bottom",
					dateFormat: dateFormat,
					lang: lang,
					context: !Capriza.device.isMobile ? $('.viewport') : undefined,

					selectType: selectionMode.type ? selectionMode.type :'day',
					multiSelect: selectionMode.type == "multi",
					closeOnSelect: (selectionMode.type != "multi") && selectionMode.closeOnSelect,
					firstSelectDay: selectionMode.selectFromDay,
					showOnFocus: false,

					liveSwipe:!window.isDesignerPreview,//TODO: should disable in desktop ?
					//,showDivergentDays: false
					buttons: ['set', 'cancel', 'clear']
				};

				this.mobiOptions.onClear = function () {
					if (!Capriza.Views.Datepicker.ignoreEvent) {
						self.saveDatesToModel("");
					}
					self.alterIconsVisibility();
				}


				//////////////////////////////////
				//Handle Lazy loading of data "server side month scroll"
				if(self.minDisplayDate || self.maxDisplayDate){

					function loadMonthIfNeeded(year, month, instance){
						var thisMonth = new Date(year, month, 3); // dont use 1st in month to prevent utc time issues
						self.lastLoadedMonth = thisMonth;
						self.saveToPageState("lastLoadedMonth",thisMonth);
						if(self.maxDisplayDate && thisMonth > self.maxDisplayDate){
							self.showCalLoading();
							self.model.api.nextMonth();
						}
						if(self.minDisplayDate && thisMonth < self.minDisplayDate){
							self.showCalLoading();
							self.model.api.prevMonth();
						}
					};
					onMonthChangeEvents.push(loadMonthIfNeeded);

					onMonthChangeEvents.push(self._setOutOfRangeDaysAsInvalid);

					///////////////////////////////////
					// Verify displayed date is in the min/max range
					function onBeforeShow(inst){
						var dateToShow = self._getDateToShow(inst.getDate());
						if(dateToShow){
							inst.navigate(dateToShow);
						}
						self._setOutOfRangeDaysAsInvalid(false, false, inst);
					};
					this.mobiOptions.onBeforeShow = onBeforeShow;

				}

				function _onShow($el, valText, inst) {
					self.saveToPageState("isShown",true);
					self._onDisplayChange();
					self.$calArea= $('div.dwc.dw-cal-c', $el);
					_.each(onShowEvents,function(func){func($el, valText, inst);});
				}
				this.mobiOptions.onShow = _onShow;


				function _onMonthChange(year, month, inst) {
					$(".dw-cal-btn").keyup();//prevent multiple events
					_.each(onMonthChangeEvents,function(func){

						func.apply(self, [year, month, inst]);
					});
					setTimeout(self._onDisplayChange, 1000);
				}
				this.mobiOptions.onMonthChange = _onMonthChange;

				///////////////////////////////////////////////////////////////
				// Init legend if needed.
				if(markTypes && Object.keys(markTypes).length > 0) {

					var types = Object.keys(markTypes);

					$legend = $('<div class="calendar-legend"><div class="calendar-panel"><ul></ul></div></div>');

					var $ul = $('ul',$legend);

					_.each(types, function(key){
						var item = markTypes[key],
						    $li = $('<li><span class="mark-color">&nbsp;</span><span class="mark-text"></span></li>');
						if(item.color){
							$('.mark-color',$li).css({background:item.color});
						}
						if(item.text){
							$('.mark-text',$li).text(item.text);
						}
						$li.appendTo($ul);
					});

					onShowEvents.push(function addLegend($calEl, valText, inst) {
						$('div.dwc.dw-cal-c', $calEl).prepend($legend);
						$legendPanel = $(".calendar-panel", $legend);
						$legendPanel.click(function () {
							_toggleLegend();
						});
					});


					//Only load translation if the mobiscrollLangPack extensions was enabled and a translation to the current lang is available
					var translation = self.mobiOptions.lang && $.mobiscroll.i18n[self.mobiOptions.lang] && self.translations[self.mobiOptions.lang] && self.translations[self.mobiOptions.lang];
					var calendarText = translation && translation["Calendar"] || "Calendar";
					var legendText = translation && translation["Legend"] || "Legend";

					function _toggleLegend() {
						isLegendVisible = !isLegendVisible;

						if(!$legendButton && $(this).hasClass('dwb')){
							$legendButton = $(this);
						}
						if(isLegendVisible){
							$legendButton.text(calendarText);
						} else {
							$legendButton.text(legendText);
						}
						//$legendButton.toggleClass("legend-is-open", isLegendVisible);
						$legend.toggleClass("calendar-legend-visible", isLegendVisible);
					};

					this.mobiOptions.buttons = [
						'set',
						{ text: legendText, handler: _toggleLegend },
						'cancel',
						'clear'
					];

					onCloseEvents.push(function hideLegend(){
						isLegendVisible && _toggleLegend();
						$legendButton = undefined;

					})
				}


				function _onClose() {
					self.saveToPageState("isShown",false);
					_.each(onCloseEvents,function(func){
						func.apply(self);
					});
				};

				this.mobiOptions.onClose = _onClose;


				if(Capriza.device.stock){
					this.mobiOptions.tap=false; // fixes the problem that the background items are clicked while interacting with the dilog

					/**
					 * adding a dummy function on touchstart fixes the scrolling issue.
					 * ticket #8382.
					 * Happens in stock browsers with Android version < 4.3
					 */
					function stockDateScrollFix(){}

					onShowEvents.push(function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).on('mousedown', stockDateScrollFix);
						});
					});

					this.mobiOptions.onClose = function(){
						$('[role="dialog"].dw-webkit').find('*').each(function(){
							$(this).off('mousedown', stockDateScrollFix);
						});
					}
				}


				///////////////////////////////////////////////////////////////
				// Init the mobiscroll itself
				$input.mobiscroll().calendar(this.mobiOptions);
				self.calInst = $input.mobiscroll('getInst');
				//////////////////////////////////////////////////////////////
				// Set preselected day(s) or clear if none
				if (selectedDays && selectedDays.length > 0) {
					self._setDatesForMobiscroll(selectedDays);
					if($input.val() == ""){ //this is due to mobiscroll bug where the input is not populated in some cases  (like today) when initialized
						$input.val(this.calInst.val)
					}
				}

				//self.saveToPageState("lastLoadedMonth",thisMonth);
				if(self.loadFromPageState("lastLoadedMonth")){
					self.lastLoadedMonth = self.loadFromPageState("lastLoadedMonth");
				}

				this.alterIconsVisibility(); // needed for the drill down

				$input.on("change", function() {
					if (!Capriza.Views.Calendar.ignoreEvent) {
						var calValues = self._getMobiscrollValues(),
						    values = _.map(calValues,function(value, key){
							    return self.toUtc(new Date(value));
						    });

						self.saveDatesToModel(values);
					}
					self.alterIconsVisibility();
				}).on("click",function(e){
					e.stopPropagation();
					e.preventDefault();
				});

				if(self.loadFromPageState("isShown")){
					self.calInst.show(true);
				}

			},

			showCalLoading: function(){
				var $loading = $('<div class="calendar-screen-block"></div>'), self = this;
				$loading.css(
					{
						width: "100%",
						height: "100%",
						position: "absolute",
						top: 0,
						left: 0,
						background: "rgba(0,0,0,0.5)",
						"z-index":900
					}
				).click(function(){
					//this.remove()
				});
				if(self.$calArea) self.$calArea.prepend($loading);
			},

			_onDisplayChange: function(){
				return false;
			},

			_getDateToShow: function(date){
				if(this.maxDisplayDate && this.lastLoadedMonth < this.maxDisplayDate && this.minDisplayDate && this.lastLoadedMonth > this.minDisplayDate) return this.lastLoadedMonth;//Already was between range limits
				var thisMonth = date || new Date();
				if(this.maxDisplayDate && thisMonth > this.maxDisplayDate){
					return this.maxDisplayDate;
				}
				if(this.minDisplayDate && thisMonth < this.minDisplayDate){
					return this.minDisplayDate;
				}
				return false;
			},

			_removeAllSelectedValues: function(){
				var currSelected = this._getMobiscrollValues(),
				    self = this;

				if(self.calInst) {
					_.each(currSelected, function (val) {
						self.calInst.removeValue(val);
					});
				}
			},

			_getInitInvalidDays: function () {
				var self = this,
				    invalidDays = this.model.get("invalidDays"),
				    ret = undefined;

				if(invalidDays){
					ret = [];
					_.each(invalidDays,function(item){
						if(item.length == 2){
							ret.push(item);
						}
						if(item.length == 24){
							ret.push(self.fromUtc(self.fromEngineFormatToDate(item)));
						}
					});
				}

				return ret;
			},

			_getInitMarkedDays : function(mkdDays){
				var self = this,
				    markedDays = mkdDays || this.model.get("markedDays"),
				    markTypes = this.model.get("markTypes"),
				    ret = undefined,
				    defaultColor = "#ccc";

				if(markedDays){
					ret = [];
					_.each(markedDays,function(item){
						var type = markTypes[item.type];
						if(!item.data) item.data = {};

						var mark = {
							d: self.fromUtc(self.fromEngineFormatToDate(item.day)),
							color: item.data.color ? item.data.color : (type && type.color ? type.color : defaultColor),
							text : item.data.text ? item.data.text : (type && type.text ? type.text : undefined),
							icon : item.data.icon ? item.data.icon : (type && type.icon ? type.icon : undefined)//TODO: CHeck if it works with our already used fontawesome
						};
						ret.push(mark);
					});

				}
				return ret;
			},

			saveDatesToModel: function(dates){
				var self = this;
				if(this.maxDisplayDate || this.minDisplayDate) {
					dates = _.filter(dates, function (d) {
						//check if the date is in the range (if a range side is specified)
						return (self.minDisplayDate ? d >= self.minDisplayDate : true ) && (self.maxDisplayDate ? d <= self.maxDisplayDate : true);
					});
				}
				if(dates[0]) {this.lastLoadedMonth = dates[0]; self.saveToPageState("lastLoadedMonth",dates[0]);}
				this.model.api.setDates(dates);
			},

			_getMobiscrollValues: function () {
				//TODO find why  $input.mobiscroll('getValues') does not work sometimes...
				return this._shouldUseMultiAPI() ? this.calInst.getValues() : [this.calInst.getDate()];
			},

			_setDatesForMobiscroll: function(dates) {
				var self = this, $input = this.$("input");
				if (dates && dates.length > 0){
					var currValues = this._getMobiscrollValues($input), newValues = this.arrayFromUtc(this.fromEngineFormatToDateArray(dates));
					if (!currValues || !this.compareDatesArrays(newValues,currValues)) {
						self.selectedDays = newValues;
						console.log("updating date on mobiscroll");
						Capriza.Views.Calendar.ignoreEvent = true;
						if(this._shouldUseMultiAPI()){
							$input.mobiscroll('setValues', newValues, true);
						} else{
							$input.mobiscroll('setDate', newValues[0], true);
						}

						Capriza.Views.Calendar.ignoreEvent = false;
					}
				} else {
					this._removeAllSelectedValues();
					$input.val(""); // this line is necessary for the drill pages
					this.alterIconsVisibility();
				}
			},

			_shouldUseMultiAPI: function(){
				//TODO: open defect to mobi why getValues is not working in 'day' mode
				return this.mobiOptions.multi || this.mobiOptions.selectType == 'week';
			},

			_verifyMinMax: function(){
				var lastLoadedMonth = this.loadFromPageState("lastLoadedMonth");
				if(lastLoadedMonth
					&& this.minDisplayDate && this.minDisplayDate < lastLoadedMonth
					&& this.maxDisplayDate && this.maxDisplayDate > lastLoadedMonth){
					this.lastLoadedMonth = lastLoadedMonth;
					this.calInst.navigate(this.lastLoadedMonth);
					this.saveToPageState("lastLoadedMonth",undefined);
				}
			},

			_setOutOfRangeDaysAsInvalid: function(year, month, instance){
				var invalidDays = this._getInitInvalidDays() || [];
				for(var i = 1;i < 16;i++){
					if(this.maxDisplayDate){
						var maxInc = new Date(this.maxDisplayDate.toISOString());
						maxInc.setDate(maxInc.getDate() + i);
						invalidDays.push(maxInc);
					}
					if(this.minDisplayDate) {
						var minDec = new Date(this.minDisplayDate.toISOString());
						minDec.setDate(minDec.getDate() - i);
						invalidDays.push(minDec);
					}
				}
				instance.settings.invalid = invalidDays;
				instance.refresh();
			},

			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Setters

			setMinDisplayDate:function(minDisplayDate){
				var mdd = this.fromUtc(this.fromEngineFormatToDate(minDisplayDate));
				if(mdd == this.minDisplayDate) return;
				this.minDisplayDate = mdd;
				if(this.$calArea) $(".calendar-screen-block",this.$calArea).remove();
				this._verifyMinMax();
				this._setOutOfRangeDaysAsInvalid(false,false,this.calInst);
			},
			setMaxDisplayDate:function(maxDisplayDate){
				var mdd = this.fromUtc(this.fromEngineFormatToDate(maxDisplayDate));
				if(mdd == this.maxDisplayDate) return;
				this.maxDisplayDate = mdd;
				if(this.$calArea) $(".calendar-screen-block",this.$calArea).remove();
				this._verifyMinMax();
				this._setOutOfRangeDaysAsInvalid(false,false,this.calInst);
			},

			setMarkedDays:function(markedDays){
				if (this.calInst && this.calInst.settings) {
					this.calInst.settings.marked = this._getInitMarkedDays(markedDays);
					this.calInst.refresh();
				}
			},
			setSelectedDays: function(selDays){
				this.selectedDays = selDays;
				this._setDatesForMobiscroll(selDays);
				return;
			},

			setMinDate:function(minDateStr){
				var minDate = this.fromUtc(this.fromEngineFormatToDate(minDateStr));
				var isVis = this.calInst.isVisible();
				this.mobiOptions.minDate = minDate;
				this.calInst.option('minDate', minDate);
//            this.calInst.refresh();
				isVis && this.calInst.show(true);
			},

			setMaxDate:function(maxDateStr){
				var maxDate = this.fromUtc(this.fromEngineFormatToDate(maxDateStr));
				var isVis = this.calInst.isVisible();
				this.mobiOptions.maxDate = maxDate;
				this.calInst.option('maxDate', maxDate);
//            this.calInst.refresh();
				isVis && this.calInst.show(true);
			},

			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Helpers

			sortDates: function(dates){
				return dates.sort(function(a,b){
					return a > b ? 1 : b > a ? -1 : 0;
				})
			},

			fromEngineFormatToDateArray : function(dates){
				var self = this;
				return _.map(dates,function(value){
					return self.fromEngineFormatToDate(value);
				});
			},

			compareDatesArrays: function(ds1, ds2){
				if(ds1.length != ds2.length){
					return false
				}
				ds1 = this.sortDates(ds1);
				ds2 = this.sortDates(ds2);

				for(var i=0 , l=ds1.length ; i<l ; i++){
					if(!ds1[i] || !ds2[i] || !this.compareDates(ds1[i],ds2[i])){
						return false
					}
				}
				return true;
			},

			arrayFromUtc:function(dates){
				var self = this;
				return _.map(dates,function(d){return self.fromUtc(d)});
			},

			arrayToUtc:function(dates){
				var self = this;
				return _.map(dates,function(d){return self.toUtc(d)});
			},
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/DatePickerButton.js

try{
	(function() {
		Capriza.Views.DatePickerButton = Capriza.Views.AbstractDatePicker.extend({
			template: "datepicker-button",

			_post: function() {
				this.setName(this.model.get("name") || " ");
				this.setIcon(this.model.get("icon"));
				var $input = this.$("input"),
				    button = this.$(".value");


				button.on("click", function() {
					$input.focus();
					$input.click();
				});

				this._initWithMobiscroll();
			},

			setIcon: function(iconClass){
				$i = this.$("i");
				if (!iconClass) {
					$i.remove();
					return;
				}

				if (!$i.length) {
					$i = $("<i></i> ");
				}
				$i.attr("class", iconClass);

				if (/right/.test(this.model.get("iconDisplay"))) {
					$i.appendTo(this.$(".value"));
				} else {
					$i.prependTo(this.$(".value"));
				}
			},

			//todo: this method overrides (DELETES) the icon if there was any.. because icon is an <i> element inside the $value.
			//the reason it worked is because there is no monitoring on button texts..
			setName: function(name) {
				var buttonElement = this.$(".value")[0];
				var valueText = buttonElement.childNodes[0]==buttonElement.firstElementChild ? buttonElement.childNodes[1] : buttonElement.childNodes[0];
				if (valueText && valueText.nodeValue) {
					valueText.nodeValue = _.sanitize(name);
				} else {
					buttonElement.text(_.sanitize(name));
				}

			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/DatePickerInput.js

try{
	(function() {
		Capriza.Views.DatePickerInput = Capriza.Views.AbstractDatePicker.extend({
			template: "datepicker-input",

			_post: function() {
				var self = this,
				    $input = this.$("input"),
				    symbolIcon = this.$("span.icon"),
				    deleteIcon = this.$("button.icon");

				// when finished initialization check which icon will be displayed.
				this.alterIconsVisibility();
				deleteIcon.on("click", function() {
					$input.val("");
					self.saveDateToModel("");
				});

				symbolIcon.on("click", function() {
					$input.focus();
					$input.click();
				});

				self._initWithMobiscroll();
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/CalendarButton.js

try{
	(function() {
		Capriza.Views.CalendarButton = Capriza.Views.AbstractCalendar.extend({
			template: "datepicker-button",

			_post: function() {
				this.setName(this.model.get("name") || " ");
				this.setIcon(this.model.get("icon"));
				var $input = this.$("input"),
				    button = this.$(".value");


				button.on("click", function() {
					$input.focus();
					$input.click();
				});

				this._initWithMobiscroll();
			},

			setIcon: function(iconClass){
				$i = this.$("i");
				if (!iconClass) {
					$i.remove();
					return;
				}

				if (!$i.length) {
					$i = $("<i></i> ");
				}
				$i.attr("class", iconClass);

				if (/right/.test(this.model.get("iconDisplay"))) {
					$i.appendTo(this.$(".value"));
				} else {
					$i.prependTo(this.$(".value"));
				}
			},

			//todo: this method overrides (DELETES) the icon if there was any.. because icon is an <i> element inside the $value.
			//the reason it worked is because there is no monitoring on button texts..
			setName: function(name) {
				var buttonElement = this.$(".value")[0];
				var valueText = buttonElement.childNodes[0]==buttonElement.firstElementChild ? buttonElement.childNodes[1] : buttonElement.childNodes[0];
				if (valueText && valueText.nodeValue) {
					valueText.nodeValue = _.sanitize(name);
				} else {
					buttonElement.text(_.sanitize(name));
				}

			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/CalendarInput.js

try{
	(function() {
		Capriza.Views.CalendarInput = Capriza.Views.AbstractCalendar.extend({
			template: "datepicker-input",

			_post: function() {
				var self = this,
				    $input = this.$("input"),
				    symbolIcon = this.$("span.icon"),
				    deleteIcon = this.$("button.icon");

				// when finished initialization check which icon will be displayed.
				this.alterIconsVisibility();
				deleteIcon.on("click", function() {
					$input.val("");
					self.saveDatesToModel([]);
					self.alterIconsVisibility();
				});

				symbolIcon.on("click", function() {
					$input.focus();
					$input.click();

				});

				self._initWithMobiscroll();
				if (this.model.get('displayMode') === 'inline') {
					this.$("input").click();
				}
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Dropdown.js

try{
	;(function() {

		Capriza.Views.Dropdown = Capriza.Views.TextboxBase.extend({
			template: "dropdown",

			//P0 - Must have for flag removal
			//DONE (works OOTB): disabled behaviour
			//DONE: X button
			//DONE: placeholder / no value selected
			//DONE: style sets - modal_with_input + modal_no_input + popover (things does not get primary-color)
			//DONE: attributes update order !!!
			//DONE: combobox2 ? migration (to combobox + modal=true) ? yes.
			//DONE (works OOTB): disabled options (also radiogroup)
			//DONE: check readonly
			//DONE: x button in modal input
			//DONE: make autocomplete work
			//DONE: check popupmenubox
			//DONE: fix modal with keyboard - prevent scroll
			//DONE: move state persistence up in handlers before render of page !

			//Cache related
			//DONE: textbox
			//TODO: consider expiration for cache
			//TODO: clear cache from settings menu

			//P0.5
			//DONE: test listbox as auto login control
			//DONE: client autocomplete
			//DONE: onoffswithc1/2 inheritance relevant ? no.

			//P1 - Next phase
			//TODO: handle large lists >2000 items
			//DONE: tablet support
			//DONE: transitions
			//TODO: inheritance from relevant controls
			//TODO: maxlength validation -- call from base when with input


			/* sync / async items
        *  text vs input
        *  opener
        *  autocomplete
        *  button ?
        *  label / placeholder
        *  modal / popover
        *  selected item (s)
        *  multiselect
        *
        *
        * */

			isDropdownEnabled: function(){
				return true;
			},



			// TODO: nullify setText here since inheriting from TextboxBase. The way views are updated here is by listening to change:text on the model. This should be the way that all controls bind to data changes, and when we do it we can remove this setter.
			setText: function() {}

		});


		//////////////////////////////////////// Adapters

		Capriza.Views.Dropdown._types = {};

		Capriza.Views.Dropdown._types['listbox'] = Capriza.Views.Dropdown._types['listboxmulti'] = {
			opts: {
				hasInput: false,
				multi: false,
				preventClearTextValueFromModal:true
			},

			attributesUpdateOrder: ["items", "selectedIndex", "isDisabled", "rows", "filteredSortedRows", "textValue"],

			_initialize:function(){
				if(this.options.filterable){
					this.options.modal = true;
					this.options.modalInput = true;
				}
				if(this.options.multi){
					this.options._textboxClass = "ddlistboxmulti";
					this.options.sortByHist = false;
				}
				else{
					this.options._textboxClass = "ddlistbox";
				}
			},

			_post:function(){
				Capriza.Views.Dropdown.prototype._post.apply(this,arguments);
				var self = this;

				this.model.getItems = function(){
					var selectedIdxs = (Array.isArray(self.model.get("selectedIndex"))) ? self.model.get("selectedIndex") : [self.model.get("selectedIndex")];
					var val = "";
					//#22587 - to prevent exception when rendering dropdown without items (when inside a table that is first missing)
					var items = (self.model.get("items") || []).map(function (item, idx) {
						//var items = self.model.get("items").map(function (item, idx) {
						var row;
						if(typeof item ==="string"){
							row = {text: item};
						}
						else{
							row = _.extend({}, item);
						}
						row.idx = idx;

						if (selectedIdxs.indexOf(idx) > -1) {
							val = row.text;
							row.selected = true;
						}
						return row;
					});

					if(selectedIdxs.length > 1) val = selectedIdxs.length + " Items selected";
					self.model.set("textValue", val);
					return items;
				};


				this.model.refreshRows();

				this.model.on("change:items", this.model.refreshRows);
				this.model.on("change:selectedIndex", this.model.refreshRows);

				this.on("selectItems", function(items){
					var val = "";

					var controlPath = "";
					var indexes = items.map(function(itm){
						controlPath += "[data-idx='"+itm.idx+"'],";
						val = itm.text;
						return itm.idx;
					});
					if (controlPath){
						controlPath = controlPath.substr(0, controlPath.length - 1);
					}
					if(indexes.length == 1 && !this.options.multi) indexes = indexes[0];
					else if(indexes.length > 1) val = indexes.length + " Items selected";
					this.model.api.setSelectedIndex(indexes);
					this.model.set("selectedIndex", indexes);
					this.model.set("textValue", val);
					this.model.saveToCache();

					try{
						this.reportInteraction({
							element: "DropDown",
							interaction: "click",
							controlPath: controlPath,
							indexes: indexes,
							additionalData: "select items"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Dropdown select items interaction");
					}
					Dispatcher.trigger("control/action/end",this);
				});

				if(!this.options.multi && this.options.filterable ){
					this.on("dropdown:hidden", function(){
						self.getInput().val("");
						self.filterAndSortRows();
					});
				}
			},

			_onEnter: function (event) {
				this.options.multi ? this.$save.click()
					: Capriza.Views.Textbox.prototype._onEnter.call(this, event);
			}
		};


		Capriza.Views.Dropdown._types['autocomplete'] = {
			opts: {
				_textboxClass: "ddautocomplete",
				hasInput: true,
				opener: false,
				modal: true,
				modalInput: true,
				hideOnEmpty:true
			},

			_initialize:function(){
				this.options.modalInput = this.options.modal;
			},

			_post:function(){
				Capriza.Views.Dropdown.prototype._post.apply(this,arguments);
				var self = this;

				this.options.hideOnEmpty = !this.options.modal;

				this.model.getItems = function(){
					var items = (self.model.get("items") || []).map(function (item, idx) {
						return {idx: idx, text: item};
					});

					return items;
				};

				this.model.on("change:items", function() {
					self.hideLoading();
					self.model.refreshRows();
				});
				self.model.refreshRows();

				this.model.on("change:text", function() {
					self.model.set("textValue", self.model.get("text"))
				});

				this.model.getCurrentItemsForCache = function(){
					return [{text:this.get("text")}];
				};


				this.on("uiEventListenersAdded",function(){
					this.getInput(true).on("click",function(e){//TODO: consider option: hideOnOpenerClick + hideOnInputClick
						e.stopPropagation();
						e.preventDefault();
					})
				});

				this.on("selectItems", function(items){
					var val = "";
					var indexes = items.map(function(itm){
						val = itm.text;
						return itm.idx;
					});
					if(indexes.length == 1) indexes = indexes[0];
					this.model.api.selectItem(indexes);
					this.model.set("text", val);
					this.model.saveToCache();
					Dispatcher.trigger("control/action/end",this);
				});


				function setTerm(term) {
					self.model.set("textValue", term);
					self.model.api.setText(term);
					self.saveToPageState("term", term);
					self.showLoading();
				}

				this.on("modalInputKeyUp", function(){
					setTerm(self.getInput().val());
				});

				this.on("controlInputKeyUp", function(event){
					var inputValue = self.getInput(true).val();

					if ((self.model.get("textValue") || "") != inputValue) {
						setTerm(self.getInput(true).val());
						if(!self.shown) {
							var hoe = self.options.hideOnEmpty;
							self.options.hideOnEmpty=false;
							self.showDropdown();
							self.options.hideOnEmpty = hoe;
						}
					}
				});

				this.on("beforeShow",function(){
					self.saveToPageState("autocompleteShown", true);
					var tv = self.model.get("textValue") || "";
					if(tv.length > 0){
						setTerm(tv);
					}
				});

				this.on("beforeHide",function(){
					self.saveToPageState("autocompleteShown", false);
				});

				this.on("clear:modalinput", function(){
					this.model.api.setText("");
				});

				this.on("clear:input", function(){
					self.showDropdown();
				});

				setTimeout(function(){
					if(self.loadFromPageState("autocompleteShown")){
						self.model.refreshRows();

						self.showDropdown();
						self.hideLoading();
						self.getInput().val(self.loadFromPageState("term"));
					}
				},0);
				if(!this.options.modal) {
					this.on("dropdown:shown", function () {
						self.stopListenToChange();
					});

					this.on("dropdown:hidden", function () {
						self.listenToChange();
					});

					this.on("shield:click", function (e) {
						var clearRect = self.$clearIcon[0].getBoundingClientRect();
						if (clearRect.left < e.clientX && clearRect.right > e.clientX && clearRect.top < e.clientY && clearRect.bottom > e.clientY) {
							self.$clearIcon.click();
							e.dontHide = true;
							return;
						}
						self.changeListener();
					});
				}

				if (this.enableLocation()) {
					this.locationInput();
				}

				this.model.set("textValue", this.model.get("text"));
			}
		};


		Capriza.Views.Dropdown._types['popup'] = {
			opts: {
				_textboxClass: "ddpopup",
				hasInput: false,
				modal:false

			},

			_initialize:function(){
				if(this.options.filterable){
					this.options.modal = true;
					this.options.modalInput = true;
				}
			},

			_post:function(){
				Capriza.Views.Dropdown.prototype._post.apply(this,arguments);
				var self = this;

				this.model.getItems = function(){
					return (self.model.get("value") || []).map(function (item, idx) {
						var itm;
						if(typeof item ==="string"){
							itm = {text: item};
						}
						else{
							itm = _.extend({}, item);
						}
						itm.idx = idx;
						return itm;
					})
				};

				this.model.on("change:value", function() {
					self.hideLoading();
					if (self.model.get("value").length > 0) { // copied from PopupMenu.js::setValue
						self.model.refreshRows();
					}
				});
				self.model.refreshRows();

				this.model.on("change:valueText", function() {
					if (!self.model.get("dontUpdate")) { // copied from PopupMenu.js::setValueText
						self.model.set("textValue", self.model.get("valueText")); // YEAH I KNOW, BRAIN FUCK!!!
					}
				});
				self.model.set("textValue", self.model.get("valueText")); //BrainFuck is also needed on init ;) (regardless of "dontUpdate")

				this.on("beforeShow", function(){
					this.showLoading();
					this.model.api.openPopup();
				});

				this.on("canceling", function(){
					this.model.api.closePopup();
				});


				this.on("selectItems", function(items){
					var val = "";
					var indexes = items.map(function(itm){
						val = itm.text;
						return itm.idx;
					});
					if(indexes.length == 1) indexes = indexes[0];
					this.model.api.selectMenuItem(indexes);
					this.model.saveToCache();
					this.model.set("rows", []); // behaviour of async items
					if (!this.model.get("dontUpdate")) {
						this.model.set("textValue", val);
					}
				});
			}


		};


		Capriza.Views.Dropdown._types['menu'] = {
			opts: {
				_textboxClass: "ddmenu",
				hasInput: false
			},

			_initialize:function(){
				if(this.options.filterable){
					this.options.modal = true;
					this.options.modalInput = true;
				}
			},

			_post:function(){
				Capriza.Views.Dropdown.prototype._post.apply(this,arguments);
				var selectedIndex = this.model.get("selectedIndex");
				var val;

				this.model.getItems = function(){
					return this.get("items").map(function(item,idx){
						var itm;
						if(typeof item ==="string"){
							itm = {text: item};
						}
						else{
							itm = _.extend({}, item);
						}
						itm.idx = idx;

						if(idx == selectedIndex){
							val = item;
							itm.selected = true;
						}
						return itm;
					})
				};
				this.model.refreshRows();
				this.model.on("change:items", this.model.refreshRows);

				if(val && !this.model.get("dontUpdate")){
					this.model.set("textValue", val);
				}

				this.on("selectItems", function(items){
					//TODO: ignore -1 in menu, needs to allow canceling in base...?
					//TODO: validate length ??
					var val = "";
					var indexes = items.map(function(itm){
						val = itm.text;
						return itm.idx;
					});
					if(indexes.length == 1) indexes = indexes[0];
					this.model.api.selectMenuItem(indexes);
					if(!this.model.get("dontUpdate")){
						this.model.set("textValue", val);
					}
					this.model.saveToCache();
				});

				if(this.options.filterable){
					this.on("modal:close", function(){
						this.model.refreshRows();
						if(val && !this.model.get("dontUpdate")){
							this.model.set("textValue", val);
							try{
								self.reportInteraction({
									element: "TextBox",
									interaction: "click",
									controlPath: ".dd-close"
								});
							} catch(e){
								Logger.info("[UserInteraction] Exception on report Table do drill interaction");
							}
						}
					});
				}
			},

			setSelectedIndex: function (index) {
				var items = this.model.get("rows");
				if (items.length <= index || index < 0) return;

				items.forEach(function (item) {
					item.selected = false;
				});

				if(items[index]) items[index].selected = true;

				this.trigger("selectItems", items[index] ? [items[index]] : []);
			}

		};


		Capriza.Views.Dropdown._types['combobox'] = {
			opts: {
				_textboxClass: "ddcombobox",
				hasInput: true,
				modal:false,
				showWhenReadOnly:true
			},

			_initialize:function(){
				if(this.options.filterable){
					this.options.modal = true;
					this.options.modalInput = true;
				}
			},

			_post:function(){
				Capriza.Views.Dropdown.prototype._post.apply(this,arguments);
				var self = this;

				this.model.getItems = function() {
					var model = this;
					var value = (this.get("value") || []).map(function (item, idx) {
						var itm = {idx: idx, text: item};
						if(model.get("textValue")==item){
							itm.selected = true;
						}
						return itm;
					});
					return value;
				};
				this.model.refreshRows = function(){
					var items = this.getItems();
					var cache = Capriza.CacheManager.getHistory(this);
					items = this._mergeCache(items, cache, !this.get("isReadOnly"));
					this.set("rows", items);
				};

				//this.$openerButton.on("click",function(){
				//    self.isOpener = true;
				//});
				this.model.on("change:value", function() {
					self.hideLoading();
					self.model.refreshRows();
					// TODO: should we handle empty list? we didn't in the old combobox. I just found out that in old popup we ignore empty lists... :-/
				});

				self.model.refreshRows();

				this.model.on("change:text", function() {
					self.model.set("textValue", self.model.get("text"));
					if(this.shown) self.filterAndSortRows();
				});

				this.model.getCurrentItemsForCache = function(){
					return [{text:this.get("text")}];
				};

				this.on("beforeShow", function(){
					if(!this.options.modal && !this.model.get("isReadOnly")) this.getInput(true).focus();
					this.showLoading();
					this.model.api.openPopup();
				});

				this.on("canceling", function(){
					this.model.api.closePopup();
				});

				this.on("selectItems", function(items){
					var val = "";
					var indexes = items.map(function(itm){
						val = itm.text;
						return itm.idx;
					});
					if (indexes.length == 1) indexes = indexes[0];
					if(indexes == undefined){//setting directly from (typed) cache
						if(!this.model.get("isReadOnly"))this.model.api.setText(val);
					}
					else {
						this.model.api.selectMenuItem(indexes);
					}
					this.model.set("text", val);
					this.model.saveToCache();
					Dispatcher.trigger("control/action/end",this);
				});

				//was used for filtering not in modal
				//this.getInput(true).on("input", function(){
				//    self.isOpener = false;
				//    if(!self.shown && self.filterAndSortRows())
				//    {
				//        self.showDropdown();
				//    }
				//});

				this.on("change", function(){
					setValue(this.getInput(true).val());
				});

				this.on("clear:modalinput", function(){
					self.filterAndSortRows()
				});

				this.on("clear:input", function(){
					this.model.set("text");
					self.showDropdown();
				});

				this.on("cache:updated",function(){
					self.model.refreshRows();
				});

				function setValue(value){
					self.getInput(true).val(value);
					self.model.set("text", value);
					self.model.api.setText(value);
					self.model.saveToCache();
				}

				this.on("modal:close", function(){
					if(self.options.model.get("isReadOnly")) return;
					setValue(self.getInput().val());
				});

				if(!this.options.modal){
					this.on("dropdown:shown",function(){
						self.stopListenToChange();
					});

					this.on("dropdown:hidden",function(){
						self.listenToChange();
					});

					this.on("shield:click", function(e){
						var clearRect = self.$clearIcon[0].getBoundingClientRect();
						if(clearRect.left < e.clientX && clearRect.right > e.clientX && clearRect.top < e.clientY && clearRect.bottom > e.clientY ){
							self.$clearIcon.click();
							e.dontHide = true;
							return;
						}
						self.changeListener();
					});
				}

				this.model.set("textValue", this.model.get("text"));
			}

		};


		Capriza.Views.Dropdown._types['lookup'] = {
			opts: {
				_textboxClass: "ddlookup",
				hasInput: true,
				modal:false,
				button:true,
				opener:false,
				filterable:true,
				hideOnEmpty:true
			},
			textboxIcon: "fa fa-search",
			textboxClass: "lookup",

			_post:function(){
				Capriza.Views.Dropdown.prototype._post.apply(this,arguments);
				var self = this;


				this.model.refreshRows = function(){
					var cache = Capriza.CacheManager.getHistory(this);
					this.set("rows", cache);
					if(!cache || cache.length == 0) self.hideDropdown();
				};

				self.model.refreshRows();

				this.model.on("change:text", function() {
					self.model.set("textValue", self.model.get("text"));
				});

				this.$openerButton.css({right:"41px"});

				this.model.getCurrentItemsForCache = function(reason){
					var cacheData = this.get("cacheData");
					if(reason == "lookup:cacheNow" && cacheData && cacheData.value){
						return [{text:cacheData.value}];
					}
					return [{text:this.get("text")}];
				};

				this.model.getAdditionalValues = function(reason){
					var cacheData = this.get("cacheData");
					if(reason == "lookup:cacheNow" && cacheData && cacheData.descriptions){
						return cacheData.descriptions.map(function(item){
							return {text : (item || "")};
						});
					}
				};


				this.on("actionClicked", function(){
					this.model.api.openList();
				});

				this.on("selectItems", function(items){
					var val = items.map(function(itm){
						return itm.text;
					})[0];
					this.model.api.setText(val);
					this.model.set("text", val);
				});

				this.getInput(true).on("input", function(){
					if(!self.shown && self.filterAndSortRows())
					{
						self.showDropdown();
					}
				});

				this.on("change", function(){
					var value = this.getInput(true).val();
					this.model.set("text", value);
					this.model.api.setText(value);
					this.model.saveToCache();
				});

				this.on("clear:modalinput", function(){
					self.model.api.setText("");
				});

				this.on("clear:input", function(){
					self.model.set("text", "");
					self.showDropdown();
				});

				this.on("cache:updated",function(){
					self.model.refreshRows();
				});

				this.on("beforeShow", function (e) {
					if (self.model.get("rows").length == 0) {
						e.cancel = true;
					}
				});
				if(this.model.get("cacheData") && this.model.get("cacheData").cacheNow){
					this.model.saveToCache("lookup:cacheNow");
				}

				this.on("dropdown:shown",function(){
					self.stopListenToChange();
				});

				this.on("dropdown:hidden",function(){
					self.listenToChange();
				});

				this.on("shield:click", function(e){
					var clearRect = self.$clearIcon[0].getBoundingClientRect();
					if(clearRect.left < e.clientX && clearRect.right > e.clientX && clearRect.top < e.clientY && clearRect.bottom > e.clientY ){
						self.$clearIcon.click();
						e.dontHide = true;
						return;
					}
					self.changeListener();
				});

				this.model.set("textValue", this.model.get("text"));

			}

		};
		Capriza.Views.Dropdown.prototype._types = Capriza.Views.Dropdown._types;

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/ListTree.js

try{
	;(function() {

		function Node(data){
			this.id = data.id;
			this.label = data.label;
			this.isSelectable = data.isSelectable;
			this.hasChildren = data.hasChildren;
			this.initialSelection = data.initialSelection;
			this.selected = data.selected;
			this.parent = null;
			this.list = [];
			this.data = data.data || {};
		}
		function Tree(id){
			this._id = id || 0;
			this._data = {};
			this._list = [];
		}
		Tree.prototype={

			getNode : function(nodeId){
				return JSON.parse(JSON.stringify(this._data[nodeId]));
			},

			getChildren: function(parentId){
				var rs = [];
				var self = this;
				var list = this.getChildIds(parentId);

				for(var i = 0, len = list.length; i < len; i++){
					rs.push(self.getNode(list[i]));
				}
				return JSON.parse(JSON.stringify(rs));
			},

			getChildIds: function(parentId){
				var list = [];
				if(parentId){
					var node = this.getNode(parentId);
					if(node) list = node.list;
				} else {
					list = this._list;
				}
				return JSON.parse(JSON.stringify(list));
			},

			recreate: function(data) {
				try{
					data = JSON.parse(JSON.stringify(data));
					this._id = data.id;
					this._data = data.nodes || {};
					this._list = data.rootIds || [];
				}catch(e){
					Logger.error("Failed to recreate tree passed from the engine "+e);
				}
				return this;
			},

			stringify : function(){
				var data = {
					numOfNodes  : this.idCounter,
					id          : this._id,
					nodes       : this._data,
					rootIds     : this._list
				}
				return JSON.stringify(data);
			},

			merge : function(parentId, subTree){

				function removeBranch(id){
					var children = self.getChildIds(id);
					for(var i=0; i<children.length; i++){
						removeBranch(children[i]);
						delete self._data[children[i]];
					}
				}

				var self = this;
				subTree._list.forEach(function(id){ removeBranch(id); delete this._data[id]; }, this);

				$.extend(true, this._data, subTree._data);
			},

			toggleBreadCrumbs : function (ids){
				ids.forEach(function(id){
					var isSet = this._data[id].isBreadCrumb;
					if (isSet) this._data[id].isBreadCrumb = false;
					else this._data[id].isBreadCrumb = true;
				},this);
			},

			setBreadCrumbs : function (ids){
				ids.forEach(function(id){this._data[id].isBreadCrumb = true;},this);
			},

			getSelectedNode : function(){
				var nodes = Object.getOwnPropertyNames(this._data);
				for (var i = 0; i < nodes.length; i++){
					if (this._data[nodes[i]].selected){
						return this._data[nodes[i]].id;
					}
				}
			}
		}

		Capriza.Views.initWidget("list-tree", {

			displayType: "list-tree",

			_create : function(){

				var self = this;
				var mcId =  this.options.uniqueControlId;

				this.element.attr("id", mcId).addClass("list-tree ui-control");

				this.$tree = $("<div class='list'>").appendTo(this.element);

				this.$breadCrumbs = $("<div class='ui-control'>").append(
					$("<span style='float: left; margin-top: 2px; margin-right: 3px' class='expander fa fa-list-ul'>").css("cursor", "pointer").
					on("click",function(){
						self.currentId = undefined;
						self.clickOnBreadCrumb($(this));
					})).append(
					$("<span class='expander text' style='display'>").append("Tap to open selection options.").css("cursor", "pointer").
					on("click",function(){
						self.currentId = undefined;
						self.clickOnBreadCrumb($(this).prev());
					})
				).appendTo(this.$tree);

				this.$spinner = $("<div class='spinner'>").appendTo(this.$tree);
			},

			// todo: support tree refreshes. not used now
			// engine callback on monitored value
			// reopen a tree
			setRoot : function(newRoot){
				var rootElem = this.$breadCrumbs.find(".expander");
				this.treeData = null;
				this.clickOnBreadCrumb(rootElem);
			},

			isTreeExpander : function(elem){
				return $(elem).hasClass("expander");
			},

			toggleTreeExpanderText : function(){
				var expText = this.$breadCrumbs.find(".expander.text");
				expText.toggle();
			},

			hideTreeExpanderText : function(){
				var expText = this.$breadCrumbs.find(".expander.text");
				expText.hide();
			},

			showTreeExpanderText : function(){
				var expText = this.$breadCrumbs.find(".expander.text");
				expText.show();
			},

			markTreeExpanderClosed : function(){
				var treeExpander = this.$breadCrumbs.find(".expander:first");
				treeExpander.removeClass("open");
			},

			// todo: find a better way to represent the root.
			getTreeRootId : function(){
				return undefined;
			},

			showTree : function(){
				if(!this.currentId)this.loadBranch(this.currentId);
				else{
					var rootId = this.getTreeRootId();
					this.showCurrentSelection(rootId);
					this.showBranch(this.currentId);
				}
			},

			clickOnBreadCrumb : function(bc){
				$(bc).toggleClass("open");
				var currentSelection = $(bc).nextAll().not(".expander");

				if(this.isTreeExpander($(bc))){
					currentSelection.remove();
					if($(bc).hasClass("open")){
						this.hideTreeExpanderText();
						this.showTree();
					}else {
						this.$listContent.empty();
						this.showTreeExpanderText();
					}
				}else this.loadBranch(this.currentId);
			},

			updateTreeExpanderState : function(open){
				// mark last bc as closed.
				if(!open) this.$breadCrumbs.find("span:first").removeClass("open");
				else this.$breadCrumbs.find("span:first").addClass("open");
			},

			// engine callback - branch was fetched.
			setBranch : function(updateData){
				if(!updateData) return;

				this.$spinner.removeClass("active");

				if(!this.treeData || !updateData.parentId){
					this.treeData = new Tree().recreate(updateData.items);
					this.showCurrentSelection(updateData.parentId);
					this.highlightSelectedNode();
					this.currentId = this.treeData.getSelectedNode();

				}else{
					var parentNode = this.treeData.getNode(updateData.parentId);
					if(parentNode.hasChildren){
						var newBranch = new Tree().recreate(updateData.items);
						this.treeData.merge(updateData.parentId, newBranch);
						Logger.debug("***** Client Side: Tree structure after the merge: " + this.treeData.stringify());
						this.currentId = updateData.parentId;
						this.treeData.toggleBreadCrumbs([this.currentId]);
					}
				}

				this.showBranch(this.currentId);
			},

			loadBranch : function(parentId){
				if(!this.treeData || this.treeData.getChildren(parentId).length<=0){
					this._trigger("apicall", null, { action: "fetchBranch", data: parentId });
					if(this.$listContent) this.$listContent.empty();
					this.$spinner.addClass("active");
				}
				else{
					var parentNode;
					if(parentId) parentNode = this.treeData.getNode(parentId);
					if(parentNode && parentNode.initialSelection){
						this._trigger("apicall", null, { action: "fetchBranch", data: parentId });
						this.$listContent.empty();
						this.$spinner.addClass("active");
					}
					else this.showBranch(parentId);
				}
			},

			showBranch : function(parentId){
				var self = this;

				if(this.$listContent) this.$listContent.empty();

				var listItems = this.treeData.getChildren(parentId);
				var $items = this.$listContent || $("<ul style='margin-top: 30px'>");
				_.each(listItems, function(item) {
					var $item = $("<li class='list-item' style='position:relative'>").append(
						$("<div class='link'>").
						attr('id', item.id).
						attr('hasChildren', item.hasChildren).
						attr('selectable', item.isSelectable).
						attr('initialSelection', item.initialSelection).
						append(item.label));
					// allow drill down on the arrow, when a node is a parent
					// and is also selectable
					if(item.hasChildren){
						var $itemDrillDown =
							    $("<div style='width:10px;height:20px;position:absolute;right:0px;top:9px;'>").on("click",
								    function (e) {
									    e.stopPropagation();
									    e.preventDefault();
									    self.currentId = item.id;
									    self.updateNavigation(self.currentId, item.label, true);
									    self.loadBranch(self.currentId);
									    // reset tree expander state
									    self.markTreeExpanderClosed();
								    });
						var $rightArrow = $("<i class='fa fa-chevron-right'>");
						$itemDrillDown.append($rightArrow);
						$item.append($itemDrillDown);
					}
					// show leaf element
					else $item.find('div').addClass('has-icon');

//            else $item.find('div').append(
//                $("<div style='float:left; margin-right:8px' class='fa fa-level-up'>")
//            ).addClass('has-icon');

					$item.on("click", function(e){
						self.currentId = $(this).find('div').attr('id');
						if($(this).find('div').attr('hasChildren') === 'true' &&
							$(this).find('div').attr('selectable') === 'false'){
							self.updateNavigation(self.currentId, $(this).text(), true);
							self.loadBranch(self.currentId);
						}
						else {
							self._trigger("apicall", e, { action: "setSelectedItem", data: self.currentId });
							self.updateNavigation(self.currentId, $(this).text(), false);
						}
					});

					$item.appendTo($items);
				});

				$items.appendTo(this.$tree);
				this.$listContent = $items;
			},

			showCurrentSelection : function(parentId){

				function addParentBreadCrumb(id){
					var children = self.treeData.getChildren(id);
					if(children && children.length>0){
						var item = children[0];
						// todo: optimize breadcrumbs indication
						if(item.initialSelection || item.isBreadCrumb){
							self.treeData.setBreadCrumbs([item.id]);
							self.updateNavigation(item.id, item.label, item.hasChildren);
						}
						if(!item.selected || !item.hasChildren) addParentBreadCrumb(item.id);
					}
				}
				var self = this;
				addParentBreadCrumb(parentId);
			},

			updateNavigation : function(selectedId, label, isBranch){
				var self = this;

				this.updateTreeExpanderState(false);

				if(isBranch){
					// mark last bc as closed.
					this.$breadCrumbs.find("span:last").removeClass("open").css({"color":'', 'font-size':''});

					this.$breadCrumbs.find("span:last").after(
						$("<span style='position:relative; top:-1px; margin-left: 3px; margin-right: 3px; font-weight: bold' class='link'>").
						attr('id', selectedId).css({"cursor": "pointer"}).on("click", function(){
							self.currentId = selectedId;
							if($(this).next().length>0){
								var ids = [];
								$(this).nextAll("[id]").each(function(){ids.push($(this).attr("id"));});
								self.treeData.toggleBreadCrumbs(ids);

								$(this).nextAll().remove();
							}
							self.clickOnBreadCrumb($(this));
						}).addClass('has-icon').append(label)).after(
						$("<span style='margin-left: 3px; margin-right: 3px; font-weight: bold' class='link has-icon fa fa-chevron-right'>").css({"cursor": "pointer"}));
				}else{
					this.$breadCrumbs.find("span:last").after(
						$("<span style='position:relative; top:-1px; margin-left: 5px; font-weight: bold' class='has-icon'>").append(label)).after(
						$("<span style='position:relative; top:-1px; margin-left: 3px; font-weight: bold' class='link has-icon fa fa-chevron-right'>"));
				}

				if(!isBranch && this.$listContent) this.$listContent.empty();
			},

			highlightSelectedNode : function(){
				this.$breadCrumbs.find("span:last").css({"color":"black", 'font-size':'115%'});
			}

		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Button.js

try{
	;(function() {
		var backButtonRE = /back-button/;

		Capriza.Views.Button = Capriza.Views.UiControl.extend({

			_render: function() {
				var self = this;

				this.$el.attr("id", this.getUniqueControlId()).addClass("button");

				this.$value = $("<button class='value styleable-text'>").on("click", function(e) {
					self.onClick(e);
				}).appendTo(this.$el);

				this.setName(this.model.get("name") || " ");
				this.setIcon(this.model.get("icon"));

				if(this.hasExtraData("sensitive-action") && window.Capriza && Capriza.Capp && Capriza.Capp.touchId){
					this.checkSensitiveActionSupport();
				}

				// CapOne ADA - #14275
				var mcClass = this.model.get("mcClass");
				if (mcClass && backButtonRE.test(mcClass)) {
					this.$value.attr("aria-label", "Back");
				}

				return this.$el;
			},
			checkSensitiveActionSupport:function() {
				var _this=this;
				Capriza.Capp.touchId.isAvailable(function () {
					_this.sensitiveActionEnabled=true;
				});
			},

//        inheritedProps: ["color", "font-style", "font-weight", "line-height", "border", "box-shadow", "background-image", "background-color"],
			inheritedProps: ["color", "font-style", "font-weight", "line-height", "text-decoration", "direction", "text-align"],

			onClick: function (e) {
				Logger.debug('Buttons.js ' + this.model.get("id") + ' is clicked');
				try{
					this.reportInteraction({
						element: "Engine Button",
						interaction: "click"
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report Engine Button click interaction");
				}
				e.stopPropagation();
				if (this.model.get("disabled")) return;
				var self = this;
				if (this.sensitiveActionEnabled) {
					Capriza.Capp.touchId.verifyFingerprint("This action requires identity verification", function () {
						self.model.api.click();
					});
				} else {
					this.model.api.click();
				}

				Dispatcher.trigger("control/action/end",this);
			},

			//todo: this method overrides (DELETES) the icon if there was any.. because icon is an <i> element inside the $value.
			//the reason it worked is because there is no monitoring on button texts..
			setName: function(name) {
				var valueText = this.$value[0].childNodes[0]==this.$value[0].firstElementChild ? this.$value[0].childNodes[1] : this.$value[0].childNodes[0];
				if (valueText && valueText.nodeValue) {
					valueText.nodeValue = _.sanitize(name);
				} else {
					this.$value.text(_.sanitize(name));
				}

			},

			setIcon: function(iconClass){
				var $i = $("i", this.$value);
				if (!iconClass) {
					$i.remove();
					return;
				}

				if (!$i.length) {
					$i = $("<i></i> ");
				}
				$i.attr("class", iconClass);

				if (/right/.test(this.model.get("iconDisplay"))) {
					$i.appendTo(this.$value);
				} else {
					$i.prependTo(this.$value);
				}
			},

			setShouldUseWebColor: function() {
				if (this.model.get("shouldUseWebColor")) {
					var style = this.model.get("style");
					style && this.$value.css(style);
				}
			}
		});

		Capriza.Views.ClientButton = Capriza.Views.Button.extend({

			_post: function() {
				var className;
				var buttonType = this.model.get('clientButtonType');
				switch(buttonType){
					case "back": {
						className = "back-button";
						this.$value.attr("aria-label", "back"); // CapOne ADA - #14275
						break;
					}
					case "prev" :{
						className = "prev-switcher";
						Dispatcher.trigger("switcherPrev/show", this.$el);
						break;
					}
					case "next" :{
						className = "next-switcher";
						Dispatcher.trigger("switcherNext/show", this.$el);
						break;
					}
					case "cnfRestart" :{
						className = "cnf-restart";
						break;
					}
					case "externalLink":
					case "zappLink":
					case "phone":
					case "email":
					case "address":{
						className = buttonType + " user-action";
						var options = this.model.attributes;
						if (options) {
							this.$value[buttonType](options);
						}
						break;
					}
				}
				this.$el.addClass(className);
			},
			setData: function(){
				var buttonType = this.model.get('clientButtonType');
				switch(buttonType){
					case "externalLink":
					case "zappLink":
					case "phone":
					case "email":
					case "address":{
						var options = this.model.attributes;
						if (options) {
							this.$value[buttonType]("setData", options);
						}
						break;
					}
				}
			},

			onClick: function() {
				try{
					this.reportInteraction({
						element: (this.model.get('clientButtonType') || "bubble").capitalize() + " Button (Client)",
						interaction: "click"
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report Client Button click interaction");
				}
				switch(this.model.get('clientButtonType')){
					case "back": {
						if (!$(".viewport").hasClass("transitioning") && $('.loading-message').hasClass('hidden')) {
							pageManager.onBackClick();
						}
						break;
					}

					//ToDo: should enable send stats to engine for phone
				}
			},

			// Overrides parent's method to change tabindex
			setIsDisabled: function () {
				Capriza.Views.Button.prototype.setIsDisabled.call(this);

				var n = (this.$el.is(".disabled") ? -1 : 0);

				this.$value.attr("tabindex", n);
			}
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/OnOffSwitch.js

try{
	;
	(function() {

		Capriza.Views.OnOffSwitch3 = Capriza.Views.UiControl.extend({
			_render: function () {
				this.$el = $(Handlebars.templates['onoff-switch']({
					uniqueControlId: this.getUniqueControlId()
				}));
				this.setIsOn(this.model.get('isOn'));

				var self = this;

				this.$el.on('click', function (e) {
					e.preventDefault();
					self.$el.toggleClass('on');
					if (self.$el.hasClass('on')) {
						self.model.api.setOn();
					} else {
						self.model.api.setOff();
					}
				});

				return this.$el;
			},

			setIsOn: function (checked) {
				this.$el.toggleClass("on", !!checked)
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/File.js

try{
	;(function() {
		Capriza.Views.File = Capriza.Views.UiControl.extend({
			_render: function() {
				var _this = this;
				var uniqueControlId = this.getUniqueControlId();
				var model = _.extend(this.model.toJSON(), { uniqueControlId: uniqueControlId, placeholder: this.model.get("placeholder"), icon: this.model.get("iconLabel") });
				this.$el.file(model);
				this.$el.on("file_upload", function() {
					window[uniqueControlId + 'uploadCB'] = function(result) {
						_this.$("img").attr("src", result.imageDataURL);
						_this.model.api.setFile(uniqueControlId + '.jpeg');
					};
					window.appData && Capriza.fileUpload(uniqueControlId + 'uploadCB', { fileName: uniqueControlId + '.jpeg', sessionId: window.appData.session_id });
				});

				this.$el.on('fileset',function(e,data){
					_this.model.api.setFile(data.fileLocation);
				});
				return this.$el;
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Panel.js

try{
	/**
	 * Created by omer on 7/31/14.
	 */

	(function() {
		Capriza.Views.Panel = Capriza.Views.Group.extend({

			$innerGroup: "",
			className:"panel",

			initialize: function() {
				Capriza.Views.Group.prototype.initialize.apply(this, arguments);
				var panelHeader = this.model.get("groupHeader");
				if (panelHeader) {
					this.createAndAddControl(panelHeader);
				}
			},

			_render: function() {

				this.$el.addClass("groupEmpty");

				if (this.model.get('isForm')) {
					this.$innerGroup = $('<form class="grouping" href="#"></form>');
				} else {
					this.$innerGroup = $('<div class="grouping"></div>');
				}

				this.$el.append(this.$innerGroup);

				this.addClasses();
				this.createMobileKeyboardFormStyle();

				this.handleDock(this.model.get('vAlign'));

				if(this.model.get('grow')) {
					this.$el.addClass('undocked-area');
				}

				if(this.model.get('dock')) {
					this.$el.addClass('floating-bar');
				}

				if(this.model.get('scroll')) {
					// TODO: ugly hack, ideally the engine will not send 'scroll' attribute on main panel when there is tabController.
					var controls = this.model.get('controls'),
					    firstChildIsTabController = controls && controls[0] && controls[0].get('type') === 'tabController';

					Logger.debug("firstChildIsTabController=" + firstChildIsTabController);

					if (!firstChildIsTabController) {
						var self = this;

						this.$innerGroup.addClass('scrolling-area');
						try {
							var controlPath = "#" + self.$el[0].id + " .grouping.scrolling-area";
							var debounceInteractions = Utils.debounce(150, function (e) {
								try{
									self.reportInteraction({
										element: "main",
										interaction: "scrollTop",
										controlPath: controlPath,
										param: e && e.target && e.target.scrollTop
									});
								} catch(ex){
									Logger.info("[UserInteraction] Exception on report Scroll state inner interaction");
								}
							});
							this.$innerGroup.on("scroll", debounceInteractions);
						} catch (ex){
							Logger.info("[UserInteraction] Exception on report Scroll state outer interaction");
						}
					}
				}

				if(this.model.get('panelType')) {
					this.$el.addClass('panel-type-' + this.model.get('panelType'));
				}

				if (this.$el.hasClass('has-dock')) {
					//var $scrollArea = this.getScrollingContainer()//$('.scrolling-area')
					var $scrollArea = this.getClosestScrollingContainer()//$('.scrolling-area')
						, $upperBar = this.$('.dock-top'),
						  firstChild = $scrollArea.children().length && $scrollArea.children()[0];

					if ($upperBar.length > 0 && firstChild){

						var styles = getComputedStyle(firstChild);
						if (styles) {
							var marginTop = styles.getPropertyValue("margin-top");

							$scrollArea.scroll(function() {
								if (firstChild.getBoundingClientRect().top-marginTop < $upperBar[0].getBoundingClientRect().bottom) {

									$upperBar.addClass('scroll-shadow');

								}
								else {
									$upperBar.removeClass('scroll-shadow');
								}
							})
						}

					}
				}

				if (this.model.get('collapsible')) {
					this.wrapWithCollapsible();
				}

				if(this.model.get('panelType') == 'header') {
					this.$el.addClass('header');
				}

				return this.$el;
			},


			handleDock: function (vAlign) {

				this.$el.toggleClass('dock-top', this.model.get('dock') === 'top');
				this.$el.toggleClass('dock-bottom', this.model.get('dock') === 'bottom');

				setTimeout(function(){Capriza.device.fixIpadLandscape("Bottom panel added")}, 100);

			},

			/**
			 * TODO - ok this is too hacky now. we need HeaderPanel.js. will do it for MED 7
			 * @param otherView
			 */
			replaceWith: function(otherView) {
				var isActive = this.$el.hasClass('active');
				Capriza.Views.Group.prototype.replaceWith.apply(this, arguments);
				if (this.model.get('panelType') === 'header' && !this.model.parent.get("isModal")){
					otherView.$el.toggleClass('active', isActive);
					Dispatcher.trigger("sideburger/show", otherView.$el);
				}
			},

			addControl: function(control) {
				if(control.get("missing")) {
					return;
				}
				var view = this.options.page.getView(control.get("id")), $childViewEl;

				$childViewEl = view.render();

				this.$el.removeClass("groupEmpty");

				if(control.get('type')=="panel"){
					this.$el.addClass('has-dock');
				}

				this.$innerGroup.append($childViewEl);
				if (control.get('panelType') && control.get('panelType') == 'header'){
					this.options.page.replaceHeaderContent($childViewEl);
				}

			},

			addViewAtIndex: function(view, index) {
				this.$el.removeClass("groupEmpty");
				Capriza.Views.Group.prototype.addViewAtIndex.call(this,view, index);
			},

			prependEl: function ($view) {
				this.$innerGroup.prepend($view);
			},

			/**
			 * The mobile-form keyboard has a built-in go button
			 */
			createMobileKeyboardFormStyle: function (){
				if (this.model.get('isForm')) {

					Logger.debug("[Panel][wrapInForm] Wrapping textboxes in form for group: " + this.model.get('id'));
					// take the last btn in the form.
					var submitButton = $('.button > .value', this.$innerGroup).last(), self = this;
					$('.textbox', this.$innerGroup).each(function() {
						var textboxView = $(this).data('uicontrol');
						if (!textboxView) {
							Logger.debug("[Panel][wrapInForm] ERROR - couldn't find the textbox view in the form");
							return;
						}
						self.listenTo(textboxView, 'enterKeyPressed', function () {
							Logger.debug("[Panel][wrapInForm] Enter key pressed ('enterKeyPressed' received), clicking on the submit button");
							submitButton.click();
						});
						textboxView.setIsInForm();
					});

					this.$("form").submit(function(){ return false; });
				}

			},


			/**
			 * add classes for the group according to the model
			 */
			addClasses: function(){
				var direction = this.model.get('direction');
				if (direction) this.$el.addClass(direction + '-layout');

				var widthMode = this.model.get('widthMode');
				if (widthMode) this.$el.addClass('width-mode-' + widthMode);

				var vAlign = this.model.get('vAlign');
				if (vAlign) this.$el.addClass('align-grouping-' + vAlign);

				this.$el = Capriza.Views.Group.prototype._render.call(this);
			},

			setShouldUseWebColor: function() {
//            if (!this.options.ignoreILE && this.model.get("shouldUseWebColor")) {
//                this.$innerGroup.removeClass('no-bg-color');
//            } else {
//                this.$innerGroup.addClass('no-bg-color');
//            }
			},

			wrapWithCollapsible: function(){
				function collapsible(options){
					var that = this;
					this.options = options;
					this.state = options.state || "close";
					this.self = options.self;

					this.el = options.el;
					// Get the collapsible header
					this.header = options.header;
					this.header.addEventListener("click", that);

					// Get the collapsible content
					this.content = options.content;
					this.content.classList.add("collapsible-content");

					//add the arrow icon
					this.icon = setCollapsibleHeader(that.header, options.openerIcon);
					this.icon.addEventListener("click", that);


					//add the blocker
					this.blocker = setBlocker(that.el);
					this.el.appendChild(that.blocker, that.content);
					this.blocker.addEventListener("transitionend", that);
					this.blocker.addEventListener("webkitTransitionEnd", that);

					if (options.isOpen){
						this.state = "open";
					}

					this._render();
				}

				function createCollapsibleHeader() {
					var control = this.model.get("groupHeader");
					if (control) {
						var view = this.options.page.getView(control.id);
						view && view.render().appendTo(this.$collapsibleHeader);
					} else {
						this.$collapsibleHeader.append($("<div tabindex='0'></div>"));
					}
				}

				function calcTime(forHeight){
					return Math.min(Math.max(300,forHeight + 150), 900) + 'ms';
				}

				function setElementTransition(currentObj, withAnimation, duration, toPos) {
					if (currentObj.classList.contains("floating-bar")) return;
					currentObj.style.transition = withAnimation ? 'transform cubic-bezier(.21,.72,.71,.96) ' + duration : "";
					currentObj.style.transform = toPos ? "translate3d(0," + toPos + "px, 0)" : (withAnimation ? "none" : "" );
					if (withAnimation) {
						currentObj.classList.add("animating");
						currentObj.addEventListener("transitionend", this);
						currentObj.addEventListener("webkitTransitionend", this);
					}
				}

				function nextElement(currentElement){
					var expectedElement = currentElement,
					    parentElement = currentElement.parentNode,
					    parentParentElement = parentElement.parentNode;
					// get the next visible element. don't move this element container.
					// for horizontal groups: all elements in the group need to move as if they where the original element
					while (parentElement !== document && parentParentElement !== document && // hard stop at document level
					((!expectedElement.nextElementSibling && // if the next element exists continue
						!parentElement.classList.contains("scrolling-area") &&
						!parentParentElement.classList.contains("floating-bar") &&
						!(parentElement.classList.contains("tab-content") && parentElement.classList.contains("active")))  // if we are at top evel continue
						|| parentParentElement.classList.contains("horizontal-layout")
					)){
						expectedElement = parentElement;
						parentElement = parentElement.parentNode;
						parentParentElement = parentElement.parentNode;
						if (parentElement.classList.contains("viewport") || parentParentElement === document|| parentElement.classList.contains("horizontal-layout") || parentParentElement.classList.contains("horizontal-layout")) return false;

					}
					expectedElement = expectedElement.nextElementSibling;
					while (this.parentsList && this.parentsList.indexOf(expectedElement) > -1 && expectedElement.children.length > 0){
						// the expected element is a container of the current element, need to drill in this container

						if (expectedElement.classList.contains("horizontal-layout") || expectedElement.parentElement.classList.contains("horizontal-layout")) return false;
						expectedElement = expectedElement.children[0];
					}
					if (expectedElement && expectedElement.classList.contains("floating-bar")) return null;
					return expectedElement;
				}

				function isPageElement(element){
					return element === document ||
						element.classList.contains("scrolling-area") ||
						element.classList.contains("floating-bar") ||
						(element.classList.contains("horizontal-layout")  && !element.classList.contains("collapsible-container")) ||
						element.classList.contains("tab-content");
				}

				function getTopParent(originElement){
					var parentElement = originElement.parentNode,
					    parentParentElement = parentElement.parentNode,
					    topParent = originElement,
					    parentsList = [];
					if (isPageElement(originElement) && !originElement.classList.contains("floating-bar")) return null;
					parentsList.push(parentElement);
					parentsList.push(parentParentElement);
					while(!isPageElement(parentElement) && !isPageElement(parentParentElement)){
						topParent = parentParentElement;
						parentElement = parentParentElement.parentNode;
						parentParentElement = parentElement.parentNode;
						parentsList.push(parentElement);
						parentsList.push(parentParentElement);
						if (originElement.classList.contains("floating-bar")) break;
					}
					this.parentsList = parentsList;
					if (isPageElement(parentParentElement)) {
						parentElement = parentParentElement;
					}
					return {"pageParent": parentElement, "topParent" : topParent} ;
				}

				function nextElementsFromTop(pageContainer, topParent, currentElement){
					if (currentElement === topParent.nextElementSibling) return null;
					var pageElement = pageContainer || currentElement.parentNode,
					    potentialNext = currentElement ? currentElement.nextElementSibling : pageElement.children[0];
					while (this.parentsList && this.parentsList.indexOf(potentialNext) > -1 && potentialNext.children.length) {
						if (potentialNext.classList.contains("horizontal-layout") || potentialNext.parentElement.classList.contains("horizontal-layout")) return false;
						potentialNext = potentialNext.children[0];
					}
					return potentialNext;
				}

				function setElementsPosition(originObj, duration, toPos, nextOriginObj, shouldStop, nextElementFun) {
					var lastElement,
					    currentObj = originObj;
					while(currentObj && (!shouldStop || !shouldStop(nextOriginObj, currentObj))){
						setElementTransition.call(this, currentObj, false, duration, toPos);
						lastElement = currentObj;
						currentObj = nextElement.call(this, currentObj);
					}
					// use to to cuase the browser to render before
					lastElement && lastElement.offsetHeight;
				}

				function elementAnimationEnd(element){
					var originIndex = element.getAttribute("originIndex");
					if (isNaN(originIndex) || !originIndex) {
						element.style.zIndex = "";
						element.removeAttribute("originIndex");
					} else {
						element.style.zIndex = originIndex;
					}
					var originPos = element.getAttribute("originPos");
					if (originPos) {
						element.style.position = originPos;
					} else {
						element.removeAttribute("originPos");
						element.style.position = "";
					}
					setElementTransition.call(this, element, false, 0, "");
				}

				function moveNextElements(originObj, moveUp, height, duration, viewPortBottom, from){
					// move all next element by the given height
					// to move the elements Up: on closing the collapsible, will use animation from the minus height to zero
					// to move the elements Down: on open, use animation from zero to minus height
					var currentObj = nextElement(originObj);
					var fromPos = moveUp ? (from || "") : -height,
					    toPos = moveUp ? -height : (from || "");

					//set origin
					setElementsPosition.call(this, currentObj, duration, fromPos);

					//set animation destiny
					while(currentObj && currentObj != originObj){
						var currentZIndex = parseInt(currentObj.style.zIndex);
						!isNaN(currentZIndex) && currentObj.setAttribute("originIndex", currentZIndex);
						currentObj.style.zIndex = currentZIndex > 2 ? currentZIndex : 2;
						currentObj.setAttribute("originPos", currentObj.style.position);
						currentObj.style.position = "relative";
						setElementTransition.call(this, currentObj, fromPos !== toPos, duration, toPos);
						currentObj = nextElement(currentObj);
					}
					return currentObj !== false;
				}

				function movePreviousElements(originObj, $scrollingArea, moveUp, height, duration) {
					var containers = getTopParent.call(this, originObj);
					if (!containers) return; // this is floating bar
					var currentObj = nextElementsFromTop.call(this, containers.pageParent, containers.topParent);
					var toPos = "",
					    formPos = moveUp ?  height : -height;

					//set origin
					var nextOriginObj = nextElement.call(this, originObj);
					setElementsPosition.call(this, currentObj, duration, formPos, nextOriginObj, function(nextOriginObj, currentElement) {
						return currentElement == nextOriginObj;
					});
					//set animation destiny

					var changeScroll = moveUp ? height : -height;
					changeScroll += $scrollingArea.scrollTop();
					currentObj !== false && $scrollingArea.scrollTop(changeScroll);
					while(currentObj && currentObj != nextOriginObj) {
						var currentZIndex = parseInt(currentObj.style.zIndex);
						!isNaN(currentZIndex) && currentObj.setAttribute("originIndex", currentZIndex);
						currentObj.style.zIndex = currentZIndex > 2 ? currentZIndex : 2;
						currentObj.setAttribute("originPos", currentObj.style.position);
						currentObj.style.position = "relative";
						setElementTransition.call(this, currentObj, true, duration, toPos);
						currentObj = nextElementsFromTop.call(this, containers.pageParent, containers.topParent, currentObj);
					}
					return currentObj !== false;
				}

				function setCollapsibleHeader(headerContainer, openerIcon) {
					var iconSpan = document.createElement("span");
					iconSpan.classList.add("caret");
					headerContainer.appendChild(iconSpan);
					headerContainer.classList.add("collapsible-header");
					if (!openerIcon && openerIcon !== "") {
						var animatedArrow = '<svg width="14px" height="9px" viewBox="0 0 14 9" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">' +
							'<title>Page 1</title>' +
							'<desc>Created with Sketch.</desc>' +
							'<defs></defs>' +
							'<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">' +
							'<g id="iPhone-6-Copy" sketch:type="MSArtboardGroup" transform="translate(-341.000000, -297.000000)" fill="currentColor">' +
							'<g id="Rectangle-2-+-Sarah-Palin’s-Englis-+-Page-1" sketch:type="MSLayerGroup" transform="translate(0.000000, 274.000000)">' +
							'<path d="M351.609348,28.6093478 L346.276212,33.9424836 C346.015481,34.2026221 345.674555,34.3329877 345.333432,34.3329877 C344.992309,34.3329877 344.651383,34.2026221 344.390652,33.9424836 C343.869783,33.4226016 343.869783,32.5775959 344.390652,32.0569238 L348.780811,27.6665679 L344.390652,23.276212 C343.869783,22.75633 343.869783,21.9113243 344.390652,21.3906522 C344.911324,20.8697826 345.75554,20.8697826 346.276212,21.3906522 L351.609348,26.723788 C352.130217,27.2444601 352.130217,28.0886757 351.609348,28.6093478 L351.609348,28.6093478 Z" id="Page-1" sketch:type="MSShapeGroup" transform="translate(348.000000, 27.666494) rotate(-270.000000) translate(-348.000000, -27.666494) "></path>' +
							'</g>' +
							'</g>' +
							'</g>' +
							'</svg>';

						iconSpan.classList.add("arrow");
						iconSpan.innerHTML += (animatedArrow);
					} else {
						iconSpan.classList.add("userIcon");
						var userIconTag = document.createElement("i");
						$(userIconTag).addClass(openerIcon);
						iconSpan.appendChild(userIconTag);
					}
					return iconSpan;
				}

				function setBlocker(){
					var blockerDiv = document.createElement("div");
					blockerDiv.classList.add("bottomSeparator");
					return blockerDiv;
				}

				function moveBlockerBy(blocker, height, time, blockerTop, moveUp){
					var toPos = moveUp ? -1 * height : height;
					blocker.style.height = height ? height + "px" : "";
					blocker.style.top = blockerTop || "";
					blocker.offsetHeight;
					setElementTransition.call(this, blocker, !!time , time, toPos);
				}

				function getElementMargins(element) {
					var computedStyle = window.getComputedStyle(element);
					return {top: parseInt(computedStyle.getPropertyValue("margin-top").replace('px', '')) ,
						right: parseInt(computedStyle.getPropertyValue("margin-right").replace('px', '')),
						bottom: parseInt(computedStyle.getPropertyValue("margin-bottom").replace('px', '')),
						left: parseInt(computedStyle.getPropertyValue("margin-left").replace('px', ''))};
				}
				function getTotalHeight(element){
					var totalHeight = element.offsetHeight;
					var margins = getElementMargins(element);
					totalHeight += margins.top + margins.bottom;
					return totalHeight;

				}
				function cleanOtherElementDom(element){
					var containers = getTopParent.call(this, element),
					    beforeElement;

					while(containers && (beforeElement = nextElementsFromTop.call(this, containers.pageParent, containers.topParent, beforeElement))){
						elementAnimationEnd(beforeElement);
					}

					var currentObj = element;
					while(currentObj){
						elementAnimationEnd(currentObj);
						currentObj = nextElement.call(this, currentObj);
					}
				}
				function getOffsetTop(element, offsetParent){
					return element.getBoundingClientRect().top - offsetParent.getBoundingClientRect().top;
				}
				function closestParent(element, candidateScrollingArea) {
					var potentialScrollingArea = $(element).closest(".active .scrolling-area,.active .tab-content.active");
					if (potentialScrollingArea.length && potentialScrollingArea[0] === candidateScrollingArea[0]) {
						return potentialScrollingArea;
					}

					return potentialScrollingArea.length && potentialScrollingArea;

				}
				function fixBlockerColor(blocker, $scrollingArea) {
					var pageStyle = window.getComputedStyle($scrollingArea.closest(".panel-type-main")[0]);
					var background = pageStyle.getPropertyValue("background-image");
					background = pageStyle.getPropertyValue("background") || (background && background !== "none" ? background : "") || pageStyle.getPropertyValue("background-color");
					if (background && background !== "none" && background.indexOf("transparent") === -1 && background.indexOf("0)") != 14) {
						blocker.style.background = background;
					}
				}

				collapsible.prototype = {

					state: "close",

					open: function(noAnimation){
						this.state = "open";
						this._render(noAnimation);
					},
					close: function(noAnimation){
						this.state = "close";
						this._render(noAnimation);
					},
					animationOpen: function(){
						this.state = "open";
						this.open(false);
					},
					animationClose: function(){
						this.state = "close";
						this.close(false);
					},
					immediateOpen: function(){
						this.state = "open";
						this.open(true);
					},
					immediateClose: function(){
						this.state = "close";
						this.close(true);
					},

					_render: function(noAnimation){
						noAnimation = noAnimation === undefined ? this.options.noAnimation : noAnimation;
						if ((this.state === "open" && !this.el.classList.contains("collapsible-open")) || (this.state === "close" && this.el.classList.contains("collapsible-open"))) {
							this.toggle(noAnimation);
						}
					},

					handleEvent: function (e) {
						if (e.type == 'click') {
							// open or close the collapsible based on the collapsible-open class
							e.stopPropagation();
							e.preventDefault();
							this.toggle(this.options.noAnimation);
						} else if (e.type.indexOf('transitionend') > -1 ) {
							e.stopPropagation();
							e.preventDefault();
							// finish the animation property and clean the dom
							this.transitionEnd(e);
						}
					},

					/* Toggle collapsible state
                 *   base on the collapsible-open class open or close the collapsible content
                 *   move the blocker to show or hide the content
                 *   move all following element up or down
                 *
                 *   special cases:
                 *       - oppening an element that is at the bottom of the view port: need to move it up to show it's content
                 *       - closing an element that will cause the page to be smaller and to jump at the end of the animation
                 */
					toggle: function(noAnimation){
						try {
							this.self.reportInteraction({
								element: "Collapsible",
								interaction: "click",
								command: this.el.classList.contains("collapsible-open") ? "close" : "open"
							});
						} catch(e){
							Logger.info("[UserInteraction] Exception on report Toggling collapsible interaction");
						}
						if (noAnimation) {
							if (this.el.classList.contains("collapsible-open")){
								this.el.classList.remove("collapsible-open");
								this.state = "close";
								this.self.trigger("collapsible/close");
							} else {
								this.el.classList.add("collapsible-open");
								this.state = "open";
								this.self.trigger("collapsible/open");
							}
							return;
						}
						// if there is any open or close animation ignore the toggle command
						if (document.querySelectorAll(".animatingOpen").length || document.querySelectorAll(".animatingClose").length) return;
						Logger.debug("Collapsible: collapsible header clicked");
						this.self.trigger("collapsible/click");

						var that = this,
						    elClassList = this.el && this.el.classList,
						    currentIsOpen =  elClassList.contains("collapsible-open"),
						    currentHeight = getTotalHeight(this.content),
						    elMargins = getElementMargins(this.el), //if this is open need to close
						    duration = calcTime(currentHeight),
						    //$scrollingArea = closestParent(this.el, this.self.getScrollingContainer()),// use this to fix scrolling issue both on close and on open
						    $scrollingArea = this.self.getClosestScrollingContainer(),// use this to fix scrolling issue both on close and on open
						    scrollTop = $scrollingArea.scrollTop(),
						    offsetTop = getOffsetTop(this.el, $scrollingArea[0]),
						    viewPortHeight = $scrollingArea[0].clientHeight,
						    viewPortBottom = scrollTop + viewPortHeight,
						    isScrollable = false,
						    isFloatingBar = this.el.classList.contains("floating-bar");

						that.wrapperHeight = (that.wrapperHeight !== '0px' && that.wrapperHeight) || getTotalHeight(this.header);

						// calculate the height between the bottom of the header and the end of the view
						var heightBottom =  viewPortHeight - (offsetTop + that.wrapperHeight);
						fixBlockerColor(this.blocker, $scrollingArea);

						var borderBottom = window.getComputedStyle(this.el).getPropertyValue("border-bottom");
						this.el.setAttribute("borderBottom", borderBottom);
						this.el.style.borderBottom = "none";
						var isParentHorizontal = this.el.parentNode.classList.contains("horizontal-layout") ||  this.el.parentNode.parentNode.classList.contains("horizontal-layout");
						if (!currentIsOpen) { // open this collapsible
							// add a flag that the collapsible is opening
							elClassList.add("animatingOpen");
							this.state = "open";

							// add the down class for animation the default arrow down
							this.icon.classList.contains("arrow") && this.icon.classList.add("down");

							var pageHeight = $(".active .page-content").height();
							//change current wrapper height & move top by height & change group transform
							this.el.style.height = (currentHeight + that.wrapperHeight)+"px";
							// mainly for page-modal - if the page size increases due to collapsible open reduce that height from the current height
							currentHeight = currentHeight - ($(".active .page-content").height() - pageHeight);
							var blockerTop = (that.wrapperHeight - elMargins.bottom)+"px";
							this.blocker.style.top = blockerTop;
							// move the back blocker down so it will display the text behind it
							var moveUpBy = 0;

							isScrollable = $scrollingArea[0].clientHeight <= $scrollingArea[0].scrollHeight;
							var isBubbleJump = !$scrollingArea.parent().hasClass("panel-type-bubble") || $scrollingArea.parent().css("max-height") === ($scrollingArea.parent().height()+"px");
							// fix case 1: show collapsible content when it's at the bottom of the view port
							// check the distance between the bottom of the collapsible and the bottom of the view port
							if (isScrollable && heightBottom < 80 && currentHeight > heightBottom && isBubbleJump){
								// if it small something like 100px move the page so it will display as much of the content as possible
								//      until the header reaches the top of the viewport
								if (currentHeight + that.wrapperHeight > viewPortHeight && !isFloatingBar) {
									// need to move until header reaches the top of the viewport

									// calculate the distance between the top of the viewport and the top of the collapsible container
									moveUpBy = offsetTop - scrollTop;
									//  move all proceeding element up by the
								} else {
									// need to move just the content height that is outside the viewport
									moveUpBy = currentHeight - heightBottom;
								}

								if (isFloatingBar && this.el.classList.contains("dock-bottom")) {
									var changeScroll = moveUpBy;
									changeScroll += $scrollingArea.scrollTop();
									$scrollingArea.scrollTop(changeScroll);
								}

								movePreviousElements.call(this, this.el, $scrollingArea, true, moveUpBy, duration);
							}

							// move all element from this container down by the content height
							moveNextElements.call(this, this.el, false, currentHeight - (isFloatingBar ? 0 : moveUpBy), duration, isScrollable && viewPortBottom);
							if (!isParentHorizontal || isFloatingBar ){
								moveBlockerBy.call(this, this.blocker,currentHeight + elMargins.bottom , duration, blockerTop);
							} else {
								var event = document.createEvent('Event');
								event.initEvent('transitionEnd', true, true);

								this.transitionEnd.call(this, event);
							}
							Logger.debug("collpasible: opening end");
						} else { // close the collapsible
							// remove the flag that mark this collpasible as open
							elClassList.remove("collapsible-open");
							this.state = "close";
							// adding the flag that the collapsible is closing
							elClassList.add("animatingClose");

							//remove the down class so the default arrow will animate to the close position
							this.icon.classList.contains("arrow") && this.icon.classList.remove("down");

							// change the content to position absolute and make the el to show it. this is important for the closing animation
							this.el.style.height = (currentHeight + that.wrapperHeight)+"px";

							// before any content animation return to the default posion (absolute)
							this.content.style.position = "";

							var fixJumpHeight = 0;
							if (!this.el.parentElement.classList.contains("horizontal-layout") && !this.el.parentElement.parentElement.classList.contains("horizontal-layout")) {
								var nextSibling = nextElement.call(this, this.el);
								var leftOverContent = 0;
								if (nextSibling) {
									var margin = getElementMargins(nextSibling);
									leftOverContent = ($scrollingArea[0].scrollHeight - scrollTop) - (getOffsetTop(nextSibling, $scrollingArea[0]) /*nextSibling.offsetTop*/ - margin.bottom);// the minimum size for the height bottom to avoid jump
								}

								var remainingContentHeight = heightBottom - leftOverContent;

								remainingContentHeight -= Math.max(0, viewPortHeight - ($scrollingArea[0].scrollHeight - currentHeight));
								remainingContentHeight -= elMargins.top;
								// if there is a page jump we need to start moving the following elements from based on the remaining height
								isScrollable = $scrollingArea[0].clientHeight <= $scrollingArea[0].scrollHeight;
								// fix case 2: hide collapsible content when it's at the bottom of the view port - will cause jump
								// check the distance between the bottom of the collapsible-header and the bottom of the view port and compare to the rest of the content after the collapsible end
								var fixPageJump = scrollTop > 0 && remainingContentHeight > 0;
								if (fixPageJump) {
									movePreviousElements.call(this, this.el, $scrollingArea, false, remainingContentHeight, duration);
									fixJumpHeight = -remainingContentHeight;
								}
							}
							// the blocker top should be at the bottom of the collapsible group so it could animate up
							this.blocker.style.top = this.el.style.height;
							// move the blocker up to hide the collapsible content
							// move all element after the collapsible container up by the content height
							var shouldMoveBlocker = moveNextElements.call(this, this.el, true, currentHeight , duration, isScrollable && viewPortHeight, fixJumpHeight) || isFloatingBar;
							if (!isParentHorizontal || isFloatingBar ){//|| shouldMoveBlocker) {
								moveBlockerBy.call(this, this.blocker, currentHeight, duration, this.el.style.height, true);
							} else {
								var event = document.createEvent('Event');
								event.initEvent('transitionEnd', true, true);

								this.transitionEnd.call(this, event);
							}
							Logger.debug("collapsible: closing end");
						}

						var timeoutTimer = Math.min(Math.max(500,currentHeight + 350), 1100);

						// make sure that the dom is clean, there are some cases that one of the moving element was interupted so we take some spare time and making sure the animation end, the timeout is clear in the animationEnd function
						this.cleaningService && clearTimeout(this.cleaningService);
						this.cleaningService = setTimeout(function(){
							// remove all animating
							$(".animating").removeClass("animating");

							var event = document.createEvent('Event');
							event.initEvent('transitionEnd', true, true);

							that.transitionEnd.call(that, event);
						}, timeoutTimer);
					},

					transitionEnd: function(e){
						var el = document.querySelector(".animatingOpen") || document.querySelector(".animatingClose"),
						    elClassList = el && el.classList,
						    target = e.target || e.srcElement || (el && el.querySelector(".bottomSeparator"));
						if (!target) return;
						target.classList.remove("animating");
						target.removeEventListener(e.type, this);
						if (!elClassList || !elClassList.contains("collapsible-container") || document.querySelector(".animating")) {
							return;
						}
						Logger.debug("collapsible: moving animation end");
						this.cleaningService && clearTimeout(this.cleaningService);
						var blocker = this.blocker;
						moveBlockerBy(blocker);

						if (elClassList.contains("animatingOpen")) {
							// clean the DOM - just leave the collapsible-open
							elClassList.remove("animatingOpen");
							cleanOtherElementDom.call(this, el);
							elClassList.add("collapsible-open");
							$(".caret.arrow.down").removeClass("down");
							el.style.height = "";
							this.el.style.borderBottom = "";
							this.self.trigger("collapsible/open", this);
							Logger.debug("collapsible: animation openning end");
						} else if (elClassList.contains("animatingClose")) {
							// clean the DOM - just leave the content absolute
							elClassList.remove("animatingClose");
							cleanOtherElementDom.call(this, el);
							el.style.height = "";
							this.el.style.borderBottom = "";

							this.self.trigger("collapsible/close", this);
							Logger.debug("collapsible: animation closing end");
						}
						this.self.trigger("collapsible/animationEnd", this);
						Dispatcher.trigger("panel/change/after/collapsibleStateChanged");
					}
				};

				window.collapsible = collapsible;

				this.$el.addClass("collapsible-container");
				var openIcon = this.model.get('icon');

				this.$collapsibleHeader = $("<div tabindex='0'></div>");

				createCollapsibleHeader.call(this);
				$.capriza.fastClick(this.$collapsibleHeader[0]);
				this.$el.prepend(this.$collapsibleHeader);

				if (Capriza.device.isDesktop) {
					function headerKeydown(event) {
						if (event.which == 32) {
							this.click();
							return false;
						}
					}

					this.$collapsibleHeader.on('keydown', headerKeydown);
				}

				this.collapsible = new collapsible({el:this.$el[0],
					openerIcon: openIcon,
					header: this.$collapsibleHeader[0],
					content: this.$innerGroup[0],
					self: this});
				var self = this,
				    pageModel = this.options.page.model;

				self.collapsibleId = pageModel.get("uniqueId") == undefined && pageModel.tableDrill ? pageModel.get("parentPage").drillIndex + "_"  +self.model.get("mcTemplId") : self.model.id;

				var handleCollapsibleOpen = function(e){
					self.collapsibleOpenInUiState(self.collapsibleId);
					self.saveToPageState("collapsible_"+self.collapsibleId, true);

					//inherited from uiControl, notifies the page that this control now "blocks" the page,
					//until "unblockPage" or "hide" are called
					self.shouldBehaveAsBlockingControl() && self.notifyBlockPage();
				};
				var handleCollapsibleClosed = function(e){
					self.collapsibleClosedInUiState(self.collapsibleId);
					self.saveToPageState("collapsible_"+self.collapsibleId, false);

					//notify the page the collapsible no longer "blocks" the page.
					Capriza.Views.UiControl.prototype.unblockPage.apply(self);
				};

				if (this.model.get("collapsibleOpen") || this.isCollapsibleStateOpen(self.collapsibleId)) {
					if (!this.isCollapsibleStateClosed(self.collapsibleId)) {
						this.collapsible.immediateOpen();
						setTimeout(handleCollapsibleOpen,16);
					} else {
						setTimeout(handleCollapsibleClosed,16);
					}
				}
				var collapsiblePageState = this.loadFromPageState("collapsible_"+ self.collapsibleId);
				if (collapsiblePageState !== undefined){
					if (collapsiblePageState) {
						this.collapsible.immediateOpen();
					} else {
						this.collapsible.immediateClose();
					}
				}

				this.on("collapsible/open", handleCollapsibleOpen);
				this.on("collapsible/close", handleCollapsibleClosed);

				Dispatcher.on('mobile/setCollapsiblesAsBlocking', function(setAsBlocking){
					if (self.collapsible.state == "open"){
						if (setAsBlocking) self.notifyBlockPage();
						else Capriza.Views.UiControl.prototype.unblockPage.apply(self);
					}
				});

				//This method is called from the page, when the page wants to close/clear "blocking" controls
				this.unblockPage = function () {
					if (self.shouldBehaveAsBlockingControl()) {
						self.collapsible.immediateClose();
					}
				};
			},

			//if this will return true (override) the collapsible would behave like a "blocking" control (see Designer.js->navigateToControl)
			shouldBehaveAsBlockingControl: function(){
				return false;
			},

			//
			isCollapsibleStateOpen: function(collapsibleId) {
				var uiObj = this.getUiStateAndUniqueId(true);

				return uiObj.uiState && uiObj.uiState.openCollapsibles && uiObj.uiState.openCollapsibles.indexOf(collapsibleId) > -1;
			},
			isCollapsibleStateClosed: function(collapsibleId) {
				var uiObj = this.getUiStateAndUniqueId(true);

				return uiObj.uiState && uiObj.uiState.closedCollapsibles && uiObj.uiState.closedCollapsibles.indexOf(collapsibleId) > -1;
			},

			getUiStateAndUniqueId: function(checkUIState){
				var pageModel = this.options.page.model,
				    uniqueId, uiState;
				if ((!checkUIState || pageModel.get("keepUiState")) && pageModel.get("uniqueId") !== undefined) {
					uniqueId = this.options.page.model.get("uniqueId");
					uiState = Capriza.Views.uiState["page" + uniqueId] || {};
				} else if (pageModel.tableDrill && (!checkUIState || pageModel.get("parentPage").get("keepUiState"))) {
					uniqueId = pageModel.get("parentPage").get("uniqueId");
					uiState = Capriza.Views.uiState["page" + uniqueId] || {};
				}
				return {'uniqueId' :uniqueId ,'uiState' : uiState };
			},

			collapsibleOpenInUiState: function(collapsibleId) {
				var uiObj = this.getUiStateAndUniqueId();

				if (!uiObj.uiState) return;
				if (uiObj.uiState.closedCollapsibles) {
					var indexClosed = uiObj.uiState.closedCollapsibles.indexOf(collapsibleId);
					uiObj.uiState.closedCollapsibles.splice(indexClosed,1);
				}
				if (!uiObj.uiState.openCollapsibles) {
					uiObj.uiState.openCollapsibles = [];
				}
				if (uiObj.uiState.openCollapsibles.indexOf(collapsibleId) == -1) {
					uiObj.uiState.openCollapsibles.push(collapsibleId);
				}

				Capriza.Views.uiState["page" + uiObj.uniqueId] = uiObj.uiState;
			},
			collapsibleClosedInUiState: function(collapsibleId) {
				var uiObj = this.getUiStateAndUniqueId();

				if (!uiObj.uiState) return;
				if (uiObj.uiState.openCollapsibles) {
					var indexOpen = uiObj.uiState.openCollapsibles.indexOf(collapsibleId);
					uiObj.uiState.openCollapsibles.splice(indexOpen,1);
				}
				if (!uiObj.uiState.closedCollapsibles) {
					uiObj.uiState.closedCollapsibles = [];
				}
				if (uiObj.uiState.closedCollapsibles.indexOf(collapsibleId) == -1) {
					uiObj.uiState.closedCollapsibles.push(collapsibleId);
				}
				Capriza.Views.uiState["page" + uiObj.uniqueId] = uiObj.uiState;
			},

			_destroy: function() {
				var panelHeader = this.model.get("groupHeader");
				if (panelHeader) {
					this.options.page.getViews([panelHeader])[0].destroy();
				}
				Capriza.Views.Group.prototype._destroy.apply(this, arguments);
			},

			addShowMore:Utils.noop,
			setYesMore:Utils.noop
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/ClickAction.js

try{
	(function(){
		/**
		 * ClickAction functionality is added in the group scope (Group.js -> addClickAction())
		 */
		Capriza.Views.ClickAction = Capriza.Views.UiControl.extend({
			parentView: null, //should be overriden by the group control

			initialize: function(){
				_.bindAll(this, "_onClickAction", "_addClickAction", "_removeClickAction");
				if (this._initialize) this._initialize();
			},
			_render: function(){
				if (this.model.get("isDisabled") || this.model.get("missing")) return;
				Logger.debug("[ClickAction] adding click action for control: " + this.parentView.model.get("id"));
				this._addClickAction();
			},
			setMissing: function(){
				var missing = this.model.get("missing");
				if (missing) this._removeClickAction();
				else this._addClickAction();
			},
			setIsDisabled: function(){
				var isDisabled = this.model.get("isDisabled");
				if (isDisabled) this._removeClickAction();
				else this._addClickAction();
			},
			update: function(attributes){
				this._callSetters(attributes);
			},
			_destroy: function(){
				Logger.debug("[ClickAction] destroying (removing) click action for " + this.parentView.model.get("id"));
				this._removeClickAction();
			},
			_addClickAction: function(){
				this.parentView.$el.on("click", this._onClickAction)
					.addClass("clickable").attr("data-tap-mc", this.model.get("id"));
			},
			_removeClickAction: function(){
				this.parentView.$el.off("click", this._onClickAction)
					.removeClass("clickable").removeAttr("data-tap-mc");
			},
			_onClickAction: function (e){
				Logger.debug("[ClickAction] click action clicked!");
				e.stopPropagation();
				this.model.api.click();
			}

		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Carousel.js

try{
	(function() {

		function getImageInView(view) {
			var controls = view.model.get("controls");
			return controls && controls.filter(function(child) {
					return child.get("type") === "image";
				})[0];
		}

		Capriza.Views.Carousel = Capriza.Views.Group.extend({
			aspectRatio: 0.5625, // 16:9

			_render: function() {
				var $rows = $(),
				    itemCount = this.itemCount = this.model.get("controls").length,
				    aspectRatio = this.model.get("aspectRatio") || this.aspectRatio,
				    itemWidth = this.itemWidth = $(".viewport").width(),
				    totalWidth = this.totalWidth = (itemCount+2) * itemWidth,
				    height = this.height = itemWidth * aspectRatio;

				Logger.debug("carousel items=" + $rows.length + ", totalWidth=" + totalWidth + ", itemWidth=" + itemWidth + ", height=" + height);

				this.startIndex = 0; // fix Carousel issue #17842 - update not called from drag widget, so onStart isn't called.

				var lastView = this.getItemView(itemCount - 1),
				    $lastItem = lastView.render().addClass("carousel-item"),
				    lastImage = getImageInView(lastView),
				    $lastItemClone = $lastItem.clone(true),
				    firstView = this.getItemView(0),
				    $firstItem = firstView.render().addClass("carousel-item"),
				    firstImage = getImageInView(firstView),
				    $firstItemClone = $firstItem.clone(true);

				$rows = $rows.add($lastItem);
				$rows = $rows.add($firstItem);

				firstImage.on("change:src", function(model, src) {
					$firstItemClone.find("img").attr("src", src);
				});

				lastImage.on("change:src", function(model, src) {
					$lastItemClone.find("img").attr("src", src);
				});

				for (var i=1, ii=itemCount-1; i<ii; i++) {
					$rows = $rows.add(this.getItemView(i).render().addClass("carousel-item"));
				}

				$rows = $rows.add($lastItemClone).add($firstItemClone);

				this.$el.addClass("carousel").attr("id", this.getUniqueControlId() || "").on("contextmenu", function() { return false; });

				$rows.css({
					"flex-basis": itemWidth,
					"-webkit-flex-basis": itemWidth,
					"height": height,
					opacity: 0
				});

				this.$innerContainer.append($rows).css({
					width: totalWidth
				}).drag({
					onStart: this.onStart.bind(this),
					dragCallback: this.dragCallback.bind(this),
					onCancel: this.onCancel.bind(this),
					threshold: 0.2,
					swipeRight: this.swipeRight.bind(this),
					swipeLeft: this.swipeLeft.bind(this)
				});

				$("img", this.$innerContainer).each(function() {
					var $item = $(this).closest(".carousel-item");
					this.addEventListener("load", function() {
						$item.css("opacity", 1);
					}, true);
				});

				this.initProgress();

				this.showItem(0);

				return this.$el;
			},

			getItemView: function(index) {
				return this.options.page.getView(this.model.get("controls")[index].get("controls")[0].get("id"));
			},

			initInnerContainer: function() {
				return $("<div class='items'>").appendTo(this.$el);
			},

			initProgress: function() {
				var progressHTML = "<div class='progress'>";
				for (var i=0 , ii=this.model.get("controls").length; i<ii; i++) {
					progressHTML += "<div class='dot'></div>";
				}
				progressHTML += "</div>";
				this.$progress = $(progressHTML).appendTo(this.$el);
			},

			showItem: function(index, transition) {
				function moveCallback() {
					self.transitioning = false;
					if (index === - 1 || index === self.itemCount) {
						self._switchItem(index === -1);
					}
				}

				Logger.debug("carousel showItem index=" + index + ", transition=" + transition);

				var x = -this.itemWidth * (index + 1),
				    self = this,
				    dotIndex = (index + this.itemCount) % this.itemCount + 1;

				this._move(x, transition, moveCallback);

				$(".dot", this.$progress).removeClass("active");
				$(".dot:nth-child(" + dotIndex + ")", this.$progress).addClass("active");
			},

			_switchItem: function(toLast) {
				var newX;
				if (toLast) newX = -this.itemWidth * this.itemCount;
				else newX = -this.itemWidth;
				Logger.debug("carousel switching to " + (toLast ? "last" : "first") + " item: newX=" + newX);
				this._move(newX);
			},

			onStart: function() {
				Logger.debug("on start", arguments);
				this.startIndex = this.currIndex();
			},

			dragCallback: function(step, transformProp) {
//            Logger.debug("drag callback: curX=" + step.curX + ", direction=" + step.direction + ", isStarted=" + step.isStarted + ", swiping=" + step.swiping + ", toSet=" + step.toSet + ",offsetX=" + this.offsetX + ", transition=" + this.$innerContainer.css("transition"));

				if (this.transitioning) return;
				if (step.toSet >= 0 && step.direction === 'right') return;
				if (step.toSet <= (this.itemWidth - this.totalWidth) && step.direction === 'left') return;

				this._move(step.toSet);
			},

			onCancel: function(curItemX) {
				Logger.debug("on cancel, curItemX=" + curItemX);
				this.showItem(this.currIndex(), true);
			},

			swipeRight: function() {
				if (this.transitioning) return;
				var toIndex = this.startIndex + 1;
				Logger.debug("swipe right to index: " + toIndex);
				if (toIndex > this.itemCount) return;
				this.showItem(toIndex, true);
			},

			swipeLeft: function() {
				if (this.transitioning) return;
				var toIndex = this.startIndex - 1;
				Logger.debug("swipe left to index: " + toIndex);
				if (toIndex < -1) return;
				this.showItem(toIndex, true);
			},

			currIndex: function() {
				var result = Math.floor(-this.offsetX / this.itemWidth) - 1; // minus 1 is because cyclic
//            Logger.debug("currIndex: offsetX=" + this.offsetX + ", itemWidth=" + this.itemWidth + ", result=" + result);
				return result;
			},

			_move: function(x, transition, onTransitionEnd) {
//            Logger.debug("carousel move: x=" + x + ", transition=" + transition);
				var cssObj = {};
				cssObj[$.capriza.transformProperty] = "translate3d(" + x + "px, 0, 0)";
				if (transition) {
					this.transitioning = true;
					this.$innerContainer.transition(cssObj, onTransitionEnd);
				} else {
					this.$innerContainer.css(cssObj);
				}
				this.offsetX = x;
			},

			addPaginator: $.noop,
			addShowMore : $.noop,
			setYesMore  : $.noop
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Chart.js

try{
	;(function() {
		Capriza.Views.Chart = Capriza.Views.UiControl.extend({
			// common chart methods

			_loadD3: function() {
				function loadScript(src) {
					console.log("request to load " + src);
					return new Promise(function (resolve, reject) {
						var id = /.*\/(.+)$/.exec(src)[1]; // strip out leading path and extract only name of script (without path)

						if (document.querySelector("#" + id + "[ready='true']")) {
							return resolve();
						}

						var head = document.getElementsByTagName('head')[0];
						var script = document.createElement('script');
						script.onload = function(event) {
							script.setAttribute("ready","true");
							console.log(src + ' loaded and marked!');
							clearTimeout(didNotLoadId);
							resolve();
						};
						var didNotLoadId = setTimeout(function() {
							reject("Script was not loaded");
						}, 5000);
						script.type = 'text/javascript';
						script.id = id;
						script.src = (Capriza.baseUrl ? (Capriza.baseUrl + "/") : "") + src;
						head.appendChild(script);
					});
				}

				// return new PromisePromise.all([
				return loadScript("vendor/d3/d3.mobile.min.js").then(function() {
					return loadScript("vendor/d3/d3-transform.js")
				}).then(function() {
					return loadScript("vendor/d3/jquery.d3widgets.js")
				});
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Gauge.js

try{
	;
	(function() {
		var format = function (template){
			var args = Array.prototype.slice.call(arguments, 1);
			return template.replace(/\{\{|\}\}|\{(\d+)\}/g, function (curlyBrack, index) {
				return ((curlyBrack == "{{") ? "{" : ((curlyBrack == "}}") ? "}" : args[index]));
			});
		};

		Capriza.Views.Gauge = Capriza.Views.Chart.extend({
			className : "gauge",

			_render: function () {
				var self = this;
				console.log("Gauge: _render called");

				this.$el.attr("id", this.getUniqueControlId());

				self._loadD3().then(function() {
					self.$el.append("");
					self.setValues(self.model.get("values"));
				});

				return this.$el;
			},

			setValues: function (values) {
				var self = this;

				var notReadyElement = "<p class='not-available'>Org summary not ready</p>",
				    failedParsingElement = "<p class='not-available'>Failed to parse orgSummary</p>";

				console.log("*************  PAYLOAD " + values);
				try {
					if (!Array.isArray(values)) {
						console.log("payload provided to gauge chart is not a proper array");
						return;
					}

					var value = values.length ? values[0] : 0;

					$("svg, .not-available", self.$el).remove();

					var width = this.model.get("chartWidth") || self.$el.width(),
					    height = this.model.get("chartHeight") || 200;

					var options = {}; // potentially pass configurable options

					// self.$el.css({height: height, width: width});

					self.$el.coolGauges({
						type: "wiperGauge",
						options: $.extend(true, {
							value: value, // default value in terms of range
							height: height,
							width: width,
							pieAngle: 160,
							rFactor: 0.7,
							range: {
								from: 0,
								to: 1
							},
							fillColors: [{offset: "0", color: "rgb(30,160,180)"},{offset: "1", color: "rgb(36,196,155)"}],
							backgroundColor: "lightgrey",
							hand: {
								color: "grey", // color of needle
								baseRadius: 7, // radius of needle base
								width: 3       // needle stroke
							},
							margin: {left: 10, top: 10, right: 10, bottom: 30}
						}, options)
					});

					return self.$el;
				}
				catch(e) {
					$("svg, .not-available", self.$el).remove();
					self.$el.append(failedParsingElement);
				}

				return self.$el;
			}

		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Series.js

try{
	;
	(function() {
		var format = function (template){
			var args = Array.prototype.slice.call(arguments, 1);
			return template.replace(/\{\{|\}\}|\{(\d+)\}/g, function (curlyBrack, index) {
				return ((curlyBrack == "{{") ? "{" : ((curlyBrack == "}}") ? "}" : args[index]));
			});
		};

		Capriza.Views.Series = Capriza.Views.Chart.extend({
			className : "series",

			_render: function () {
				var self = this;
				console.log("Series: _render called");

				this.$el.attr("id", this.getUniqueControlId());

				self._loadD3().then(function() {
					self.$el.append("");
					self.setValues(self.model.get("values"));
				});

				return this.$el;
			},

			setValues: function (values) {
				var chartOptions,
				    self = this;

				var notReadyElement = "<p class='not-available'>Org summary not ready</p>",
				    failedParsingElement = "<p class='not-available'>Failed to parse orgSummary</p>";

				console.log("*************  PAYLOAD " + values);
				try {
					var tooltipFormat = self.model.get("tooltip") || "<div>Label: {LABEL}</div><div>Value: {VALUE}</div>";
					tooltipFormat = tooltipFormat.replace(/{LABEL}/g, "{0}").replace(/{VALUE}/g, "{1}");

					if (!Array.isArray(values)) {
						console.log("payload provided to series chart is not a proper array");
						return;
					}

					$("svg, .not-available", self.$el).remove();

					var width = this.model.get("chartWidth") || self.$el.width(),
					    height = this.model.get("chartHeight") || 200;

					var options = {}; // potentially pass configurable options

					self.$el.coolGauges({
						type: "barChart",
						options: $.extend(true, {
							values: values,
							height: height,
							width: width,
							gapFactor: 0.3,
							barColor: [{offset: 0, color: "#52A4FF"}, {offset: 100, color: "#3F91EB"}],
							margin: {left: 10, top: 1, right: 10, bottom: 1},
							showZeros: true,
							enterDuration: 400,
							tooltip: {
								formatter: function(d) {
									// if label is number that represent unix time before 10 years and up to 10 years from now then format as date
									var label = d.label;
									if (typeof label == "number" && label > 1151559129707 && label < 1782711141010) {
										label = moment(d.label).format("MMM DD YYYY");
									}
									return format(tooltipFormat, label, d.x);
								}
							}
						}, options)
					});

					return self.$el;
				}
				catch(e) {
					$("svg, .not-available", self.$el).remove();
					self.$el.append(failedParsingElement);
				}

				return self.$el;
			}


		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Pie.js

try{
	;
	(function() {
		var format = function (template){
			var args = Array.prototype.slice.call(arguments, 1);
			return template.replace(/\{\{|\}\}|\{(\d+)\}/g, function (curlyBrack, index) {
				return ((curlyBrack == "{{") ? "{" : ((curlyBrack == "}}") ? "}" : args[index]));
			});
		};

		Capriza.Views.Pie = Capriza.Views.Chart.extend({
			className : "pie",

			_render: function () {
				var self = this;
				console.log("Pie: _render called");

				this.$el.attr("id", this.getUniqueControlId());

				self._loadD3().then(function() {
					self.$el.append("");
					self.setValues(self.model.get("values"));
				});

				return this.$el;
			},

			setValues: function (values) {
				var self = this;

				var failedParsingElement = "<p class='not-available'>Failed to parse data</p>";

				console.log("*************  PAYLOAD " + values);
				try {
					var tooltipFormat = self.model.get("tooltip") || "<div>Label: {LABEL}</div><div>Value: {VALUE}</div>";
					tooltipFormat = tooltipFormat.replace(/{LABEL}/g, "{0}").replace(/{VALUE}/g, "{1}");

					if (!Array.isArray(values)) {
						console.log("payload provided to pie chart is not a proper array");
						return;
					}

					$("svg, .not-available", self.$el).remove();

					var width = this.model.get("chartWidth") || self.$el.width(),
					    height = this.model.get("chartHeight") || 200,
					    pieWidthRatio = this.model.get("pieWidthRatio") || 0.2,
					    fixedTooltips = this.model.get("fixedTooltips") !== undefined ? this.model.get("fixedTooltips") : true;

					var options = {}; // potentially pass configurable options

					self.$el.coolGauges({type: "donutPie", options: {
						values: values,
						height: height,
						width: width,
						strokePercentParam: pieWidthRatio,
						labelRadiusFactor: 1.0,
						margin: {left: 30, top: 20, right: 30, bottom: 20},
						tooltip: {
							fixed: fixedTooltips,
							formatter: function(d) {
								var label = d.label;
								if (typeof label == "number" && label > 1151559129707 && label < 1782711141010) {
									label = moment(d.label).format("MMM DD YYYY");
								}
								return format(tooltipFormat, label, d.x);
							}
						}
					}});

					return self.$el;
				}
				catch(e) {
					$("svg, .not-available", self.$el).remove();
					self.$el.append(failedParsingElement);
				}

				return self.$el;
			}

		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/notifications.js

try{
	/**
	 * Created with JetBrains WebStorm.
	 * User: oriharel
	 * Date: 9/30/13
	 * Time: 9:09 AM
	 * To change this template use File | Settings | File Templates.
	 */
	(function () {

		Dispatcher.on("notifications/show", function($headerView, notifListId) {

			function showNotifications(notifListId) {
				var notifList = Capriza.Model.ControlDB[notifListId];
				if (notifList.get("controls").length > 0) {
					showIcon(notifList, $headerView);
					if (notifList.get("expanded")) onNotifClick();
				}
			};

			Dispatcher.on('header/errors/show', function(notifListId){
				showNotifications(notifListId);
			});

			Dispatcher.on('header/errors/remove', function(){
				var iconDiv = $('.notif-wrap');
				iconDiv.addClass('faded-out'); // same as in showIcon()
				iconDiv.off('mousedown touchstart');
				$('header').removeClass('has-notif');
				$('.notif-div').remove();

				Dispatcher.trigger('unblockUI');
			});

			var notWrap = $('<div class="notif-wrap faded-out active"><div class="notif-icon"><div class="notif-sever"></div><div class="notif-sever-text"></div></div></div>');
			$headerView.append(notWrap);
			showNotifications(notifListId);

		});

		function registerToEvents($headerView) {
			var eventTrigger = Capriza.device.stock || Capriza.device.ios ? 'touchend' : 'mousedown';

			$(".notif-wrap", $headerView).off(eventTrigger).on(eventTrigger, onNotifClick);
		}

		function onNotifClick() {
			Dispatcher.trigger('blockUI', {
					onBlockUI: function(){
						var $notifDiv = $('.notif-div');
						$notifDiv.css('display', 'block');
						$notifDiv.removeClass('hide').addClass('show');
						$('.notif-icon').data('shown', true);
						$('.notif-sever-text').text('X');
					},

					onUnblockUI: function(event) {
						if (event) {
							event.preventDefault();
							event.stopPropagation();
						}

						if (notificationIsShown()) {
							$('.notif-div').removeClass('bounce').addClass('bounce-back');
							var notifIcon = $('.notif-icon');
							notifIcon.data('shown', false);
							$('.notif-sever-text').text(notifIcon.data('numOfNotifs'));
						}
					},

					isUnblockOK: function() { return !$('.notif-div').hasClass('show'); }
				}
			);
		}

		function getNotifIcon(notifSeverity) {
			switch(notifSeverity) {
				case "ERROR": return "fa-exclamation-circle";
				case "WARNING": return "fa-exclamation-triangle";
				case "INFO": return "fa-info-circle";
				default: return "fa-info-circle";
			}
		}

		function getNotifsModel(notifs) {

			var notifsArray = [], errorsCounts = 0, warningsCount = 0, infoCount = 0, worstNotif = "INFO";
			var errorsText = '', warningText = '', infoText = '', firstDelim = '', secondDelim = '', multiple = "is";
			for (var i = 0; i < notifs.length; i++) {
				var notif = notifs[i].get('controls')[0];

				switch(notif.get('severity')) {
					case "ERROR": {
						notifIcon = "icon-exclamation-sign";
						errorsCounts++;
						worstNotif = "ERROR";
						errorsText = errorsCounts + ' error';
						if (errorsCounts > 1) {
							errorsText += 's';
						}
						break;
					}
					case "WARNING": {
						notifIcon = "icon-warning-sign";
						warningsCount++;
						if (worstNotif != 'ERROR') {
							worstNotif = "WARNING";
						}
						warningText = warningsCount + ' warning';
						if (warningsCount > 1) {
							warningText += 's';
						}
						break;
					}
					case "INFO": {
						notifIcon = "icon-info-sign";
						infoCount++;
						infoText = infoCount + ' info';
						if (infoCount > 1) {
							infoText += 's';
						}
						break
					}
					default: {
						notifIcon = "icon-info-sign";
						infoCount++;
						infoText = infoCount + ' info';
						if (infoCount > 1) {
							infoText += 's';
						}
						break;
					}
				}

				notifsArray.push({notifIcon: getNotifIcon(notif.get('severity')), notifText: notif.get('text')});


			}



			if (errorsCounts > 1) {
				multiple = 'are';
			}

			if (errorsCounts == 0 && warningsCount > 1) {
				multiple = 'are';
			}

			if (errorsCounts == 0 && warningsCount == 0 && infoCount > 1) {
				multiple = 'are';
			}

			var title = 'There '+multiple+' '+errorsText+' '+warningText+' '+infoText+' in this page';

			return {notifsArray: notifsArray, notifTitle: title, worstNotif: worstNotif};

		}

		function showIcon(notifList, $headerView) {

			var notifs = notifList.get('controls');
			registerToEvents($headerView);
			$('.notif-sever-text', $headerView).text(notifs.length);
			$('.notif-icon', $headerView).data('numOfNotifs', notifs.length);
			var $viewport = $('.viewport');

			var notifsModel = getNotifsModel(notifs);

			var notifSeverEl = $('.notif-sever', $headerView);

			switch(notifsModel.worstNotif) {
				case "ERROR": {
					notifSeverEl.css('border', '1px solid red');
					break;
				}
				case "WARNING": {
					notifSeverEl.css('border', '1px solid yellow');
					break;
				}
				case "INFO": {
					notifSeverEl.css('border', '1px solid green');
					break
				}
				default: {
					notifSeverEl.css('border', '1px solid green');
					break;
				}
			}


			var $notifDiv = $('.notif-div');
			if ($notifDiv.length < 1) {
				$notifDiv = $(Handlebars.templates["notifications"](notifsModel));
				$viewport.append($notifDiv);
			}

			var $notifListEl = $('.notif-list');

			$notifListEl.empty();

			notifsModel.notifsArray.forEach(function(notif) {
				$notifListEl.append($('<li class="notif-list-item"><i class="fa '+notif.notifIcon+'"></i><div class="list-item-text">'+notif.notifText+'</div></li>'))
			});

			$('.notif-title').text(notifsModel.notifTitle);

			$notifDiv.css('pointer-events', 'auto');
			$notifDiv.bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e) {

				if (e.originalEvent.animationName === 'slideDown') {
					$notifDiv.css('z-index', 8);
					$(this).removeClass('show').addClass('bounce');
				}

				if (e.originalEvent.animationName === 'bouncedown') {
					$notifDiv.css('z-index', 5);
					$(this).removeClass('bounce-back').addClass('hide');
				}
				if (e.originalEvent.animationName === 'slideUp') {
					$(this).css('display', 'none');
				}

			});

			$('.notif-wrap', $headerView).removeClass('faded-out');
			$headerView.addClass('has-notif');
		}

		function notificationIsShown() {
			return $('.notif-icon').data('shown');
		}

		Capriza.Views.NotificationsClass = Capriza.Views.UiControl.extend({

			removeFromPage: function() {
				Dispatcher.trigger("header/errors/remove");
			},

			addToPage: function() {
				Dispatcher.trigger("header/errors/show", this.model.get('id'));
			},

			replaceWith: function(otherView) {
				Dispatcher.trigger("header/errors/show", otherView.model.get('id'));
			},

			existsInDOM: function() {
				return $(".notif-wrap").hasClass("active");
			},

			setControls: function() {
				Dispatcher.trigger("header/errors/show", this.model.get('id'));
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Tabs.js

try{
	;(function() {

		var testElement = document.createElement('div');

		var transformPrefix = "transform" in testElement.style ? "transform" : "webkitTransform";
		var transformProperty = transformPrefix === "webkitTransform" ? "-webkit-transform" : "transform";

		// Handles keyboard events for left arrow, right arrow, Home and End, and
		// simulates a click on corresponding tab header
		function tabKeyDown(event) {
			var tabHeaders = event.target.children;
			var indexMax = tabHeaders.length - 1;
			var currentIndex = $(">.active", event.target).index();

			var keyIndexMap = {37: function () {return (currentIndex - 1)},
				39: function () {return (currentIndex + 1)},
				36: function () {return 0}, 35: function () {return indexMax}};

			// get handler by key code, calculate new tab index and simulate click
			var handler = keyIndexMap[event.which];

			if (handler) {
				var i = Math.min(Math.max(0, handler()), indexMax);

				tabHeaders[i].click();
			}
		}

		Capriza.Views.TabController = Capriza.Views.Group.extend({

			initialize: function() {
				Capriza.Views.Group.prototype.initialize.apply(this, arguments);

				var self = this;

				// NOTE: excluding the designer here because a 'resize' event is triggered only when in the designer, from currentSelectedTabScrollPosition method.
				// From some reason, asking the $tabContent element for scrollTop triggers 'resize' which in turn creates an exception in the designer.
				// For reference: ticket #13689
				// EDIT: currentSelectedTabScrollPosition was removed, so without these lines this issue would be triggered from $.capriza.currentScrollPosition
				if (!window.isDesignerPreview && !window.designerLoaded) {
					$(window).on("orientationchange resize", function (e) {

						var activeTab = self.$(".tab-content.active"),
						    curIndex = self.$(".tab-content").index(activeTab);
						activeTab.removeClass('active');

						var tabId = activeTab.attr("data-mc");
						Logger.debug("Switch to tab " + tabId  + " due to resize");
						self.setSelectedTab(tabId);
					});
				}

				Dispatcher.on('control/action/end', function(control) {
					var switchTab = control.model.get("switchTab");
					if (switchTab) {
						Logger.debug("Switch to tab " + switchTab  + " due to clicking on " + control.model.get("id"));
						setTimeout(function() { self.showTab(-1,switchTab, null, "control-action"); },300);
					}
				}, this);

				Dispatcher.on('textBox/inputFocused', function(control) {
					//get active tab, get visible tab
					var $currentTab = control.$el.closest(".tab-content"),
					    $activeTab = self.$tabsContainer.find(".active");
					if ($activeTab.length && $currentTab.length && $activeTab[0] !== $currentTab[0]){
						self.$el[0].scrollLeft = 0;
						var tabId = $currentTab.attr("data-mc");
						Logger.debug("Switch to tab " + tabId  + " due to scroll into view of TextBox " + control.model.get("id"));
						self.setSelectedTab(tabId);
					}
				});
			},

			_render: function(){

				this.$el.addClass("tab-controller");

				this.$headersContainer = $("<div class='tabs-headers' tabindex='0'></div>");

				if (Capriza.device.isDesktop) {
					this.$headersContainer.keydown(tabKeyDown);
					this.$headersContainer.blur(focusLost);
				}

				if (Capriza.device.isMobile && Capriza.device.ios && Capriza.device.iosVersionNumber() < 8) {
					this.$headersContainer.on("touchstart", function(e) {
						e.stopPropagation();
						e.preventDefault();
					});

					this.options.page.$el.addClass('no-overflow-scroll');
				}

				this.$el.append(this.$headersContainer);

				this.$tabsContainer = $('<div class="tabs-container"></div>');
				this.$selectedIndicator = $("<div class='selected_tab selected_tab_above'></div>");
				this.$el.append(this.$tabsContainer);


				var pctg = this.model.get('controls').length*100;
				this.$tabsContainer.css('width', pctg+'%');
				_.each(this.model.get("controls"), this.addTabAndControls, this);

				var appendMethod = this.model.get('tabPosition') === 'bottom' ? 'prepend' : 'append';

				this.$headersContainer.children()[appendMethod](this.$selectedIndicator);
				this.$selectedIndicator = $('.selected_tab', this.$headersContainer).first();
				this.$selectedIndicator.addClass('active');

				var iconsAbove = (this.model.get("iconsPosition") == "above");
				this.$el.toggleClass("icon-above", iconsAbove).attr("id", this.getUniqueControlId() || "");

				if (!Capriza.isRTL) {

					if (Capriza.device.stock) {
						this.initOldSwipe();
					}
					else {
						this.initSwipe();
					}
				}

				this.setTabPosition();

				$(".tab-content", this.$el).eq(0).addClass("active");
				$(".tab-header", this.$el).eq(0).addClass("active");

				//Todo: Remove this when there is top header section animation for all casses
				var controllerIndex = this.model.parent &&
					this.model.parent.parent &&
					this.model.parent.parent.get("controls").indexOf(this.model.parent);

				if (this.model.get('tabPosition') === 'top' && Capriza.device.isMobile && controllerIndex == 1) {
					this.setHeadersAnimation();
				}

				this.setHeadersShadow(this.$headersContainer);

				var debounceScrollEnd = _.debounce(function(){
					self.changeDisableSwipe(false);
				}, 150, false);

				var debounceInteractions = Utils.debounce(150, function (e) {
					try {
						self.reportInteraction({
							element: "Tabs",
							interaction: "scrollTop",
							controlPath: "#" + e.target.id,
							param: e.target.scrollTop
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Tabs scroll interaction");
					}
				});
				this.$('.tab-content').scroll(function(e) {
					debounceInteractions(e);
					self.changeDisableSwipe(true);
					debounceScrollEnd();
				});

				var self = this;
				if (Capriza.device.stock) {
					setTimeout(function () {
						var $groupingContainer = self.$el.parent('.grouping');
						var tabWidth = 1 / self.model.get('controls').length * 100;
						$(".tab-content", self.$el).css('width', tabWidth + '%');
						$groupingContainer.css('overflow-y', 'hidden');
					}, 0);
				}

				if (Capriza.device.chromeWebView || Capriza.device.crosswalk) {
					$('.tab-content', this.$el).css('z-index', 1);
				}


				return this.$el;
			},

			setHeadersShadow: function($headersContainer) {

				//if ($tabContent.children().length && $tabContent.children()[0].getBoundingClientRect().top < $headersContainer[0].getBoundingClientRect().bottom) {
				$headersContainer.addClass("scroll-shadow");
				//}
				//else {
				//    $headersContainer.removeClass("scroll-shadow");
				//}

			},

			setHeadersAnimation: function() {
				var previousScroll = 0, upFired, downFired = true, self = this, inBounce, tick={}, tolerance = 5;

				var endScrollDebounce = _.debounce(function(){
					updateHeader.apply(this);
				}, 100);

				var updateHeader =  function(){
					var currentScroll = $(this).scrollTop(), direction;

					if (!inBounce && Math.abs(currentScroll - previousScroll) > tolerance)
					{
						if (currentScroll > previousScroll){
							direction = 'up';
						} else if (currentScroll < previousScroll){
							direction = 'down';
						}
					}
					previousScroll = currentScroll;
					inBounce = $(this).scrollTop() < 40 || $(this).scrollTop() + $(this).innerHeight() > this.scrollHeight - 40;

					if (direction === 'up' && !upFired) {
						self.animateHeader(true, tick);
						upFired = true;
						downFired = false;
					}
					else if ((currentScroll < 10 && !downFired && !tick.ticking) || (direction === 'down' && !downFired)){
						self.animateHeader(false, tick);
						downFired = true;
						upFired = false;
					}
					else {
						tick.ticking = false;
					}
				};

				this.$('.tab-content').scroll(function(e){
					endScrollDebounce.apply(this);
					if (!tick.ticking){
						tick.ticking = true;
						updateHeader.apply(this);
					}
				});
			},

			// handle header animation. isUp will move the header up.
			animateHeader: function(isUp, tick) {
				var y = isUp ? "-100%" : "0";
				this.$headersContainer.transition({"y": y},function(){
					if (tick) {
						tick.ticking = false;
					}
				});
			},

			positionSelectedIndicator: function(duration) {
				var firstHeaderX = $('.tab-header', this.$el).first().position().left;
				this.$selectedIndicator.transition({'x': $('.tab-header.active', this.$el).position().left-firstHeaderX , duration: duration});
			},

			initOldSwipe: function() {
				var self = this;
				var swipeRight = function() {
					var index = self.getIndexOfActiveTab();
					var targetIndex = index+1;
					var id = self.getIdOfTabByIndex(targetIndex);
					if (targetIndex < self.model.get('controls').length) {
						self.showTab(targetIndex, id, null, "swipe");
					}


				};

				var swipeLeft = function() {
					var index = self.getIndexOfActiveTab();
					var targetIndex = index-1;
					var id = self.getIdOfTabByIndex(targetIndex);
					if (targetIndex > -1) {
						self.showTab(targetIndex, id, null, "swipe");
					}

				};

				this.$el.swipe({swipeRight : swipeRight, swipeLeft : swipeLeft});
				this.$el.data('swipe', true);
			},

			initSwipe: function() {
				var self = this, extraRatio, canGoLeft, canGoRight, noDrag, elRect;
				var swipeRight = function(element, velocity) {
					var index = self.getIndexOfActiveTab();
					var id = self.getIdOfTabByIndex(index+1);
					if (index+1 < self.model.get("controls").length) self.showTab(index+1, id, velocity, "swipe");

				};

				var swipeLeft = function(element, velocity) {
					var index = self.getIndexOfActiveTab();
					var id = self.getIdOfTabByIndex(index-1);
					if (index-1 >= 0) self.showTab(index-1, id, velocity, "swipe");
				};

				var onStart = function() {
					self.animateHeader(false);
					var tabsRect = self.$tabsContainer[0].getBoundingClientRect();
					elRect = self.$el[0].getBoundingClientRect();
					extraRatio = self.$selectedIndicator && (self.$selectedIndicator.width() / elRect.width);
					canGoRight = tabsRect.left < elRect.left;
					canGoLeft = elRect.width && tabsRect.right > elRect.right;
					noDrag = self.$tabsContainer.hasClass('swiping');
				};

				var dragCallback = function(step, transformProperty) {

					if (noDrag) return;
					if (self.$tabsContainer.hasClass('swiping')) return;
					if ((step.direction === 'left' && canGoLeft) || (step.direction === 'right' && canGoRight)) {
						var toSet = step.toSet - elRect.left;
						self.$tabsContainer[0].style[transformProperty] = 'translate3d('+toSet+'px, 0, 0)';

						var oppoToSet = toSet*-extraRatio;
						self.$selectedIndicator[0].style[transformProperty] = 'translate3d('+oppoToSet+'px, 0, 0)';
					}
				};

				var onCancel = function(xMoved) {
					self.changeDisableSwipe(true);
					self.$tabsContainer.addClass('swiping');
					var index = self.getIndexOfActiveTab();
					xMoved = (index * -1 * self.$el.width());
					self.$tabsContainer.transition({ x: xMoved +'px' });
					var oppoToSet = xMoved*-extraRatio;
					self.$selectedIndicator.transition({ x: oppoToSet+'px' }, function() {
						self.changeDisableSwipe(false);
						self.$tabsContainer.removeClass('swiping');
					});
				};

				var isSwipeDisable = function(){
					return self.disableSwipe;
				};

				this.$tabsContainer.drag({swipeRight : swipeRight,
					swipeLeft : swipeLeft,
					threshold: 0.5,
					dragCallback: dragCallback,
					onCancel: onCancel,
					onStart: onStart,
					isSwipeDisable: isSwipeDisable});
				this.$el.data('swipe', true);
			},

			changeDisableSwipe: function(disable){
				this.disableSwipe = disable;
			},

			setTabPosition: function () {
				if (this.model.get("tabPosition") == "bottom") {
					this.$headersContainer.addClass('bottom');
				}
			},

			getIndexOfActiveTab: function() {
				var result;
				$('.tab-header', this.$el).each(function(index) {
					if ($(this).hasClass('active')) {
						result = index;
					}
				});
				return result;
			},

			getIdOfTabByIndex: function(index) {
				var result;
				$('.tab-header', this.$el).each(function(i) {
					if (i === index) {
						result = $(this).attr('id');
					}
				});
				return result;
			},

			addTabAndControls: function(control, index) {
				this.addControl(control);


				var self = this, id = control.get("id"), headerDiv = $("<div class='header-div'></div>"),
				    header = $("<div class='tab-header'></div>").toggleClass("master-tab-header", control.get("isMasterTab") == "true").attr("id", "tab-header-" + id).data("tab-id", id),
				    name = control.get("key"), icon = control.get("icon");


				$.capriza.fastClick(header[0]);

				$(".tabs-headers", this.$el).append(header);
				header.append(headerDiv.text(name).prepend($("<div class='header-icon'></div>").addClass(icon))).on("click", function(e) {
					e.stopPropagation();
					e.preventDefault();
					self.showTab(index, id, null, "header-click");
				});
			},

			addControl: function(control) {
				if(control.get("missing")) return;
				var view = this.options.page.getView(control.get("id"));
				this.$tabsContainer.append(view.render());
			},

			setSelectedTab: function(tabId) {
				var self = this;
				if ($("#tab-header-" + tabId).length === 0 || !this.options.page.getView(tabId)) return;
				$(".tab-header.active, .tab-content.active", self.$el).removeClass("active");
				$("#tab-header-" + tabId, this.$el).addClass("active");
				var tab = this.options.page.getView(tabId).$el;
				tab.addClass("active");

				var index = this.getIndexFromTabId(tabId);
				var targetX = this.getTargetXPctg(index);


				this.$tabsContainer[0].style[transformProperty] = 'translate3d('+targetX+'%, 0, 0)';

				var indicatorTargetX = index*100;
				self.$selectedIndicator[0].style[transformProperty] = 'translate3d('+indicatorTargetX+'%, 0, 0)';

				Logger.debug("[Tabs] setSelectedTab: tabId=" + tabId + ", indicatorTargetX=" + indicatorTargetX);

				this.saveSelectedTabToUiState(tabId);
			},

			saveSelectedTabToUiState: function(tabId) {
				// we don't currently have page split in drill page, so doing it this way is not an issue
				var uniqueId = this.options.page.model.get("uniqueId"),
				    uiState = Capriza.Views.uiState["page" + uniqueId] || {};

				uiState.selectedTab = tabId;

				Capriza.Views.uiState["page" + uniqueId] = uiState;
			},

			getSelectedTabContent: function() {
				return $('.tab-content.active', this.$el);
			},

			getIndexFromTabId: function(tabId) {
				var tab = this.$("#page" + this.options.page.model.id + tabId);
				return this.$(".tab-content").index(tab);
			},

			getTargetXPxls: function(index) {
				if (index === 0) {
					return Capriza.isRTL ? $('.tab-content', this.$el).width() : 0;
				}
				var tabWidth = $('.tab-content', this.$el).width()*index;
				return Capriza.isRTL ? tabWidth : -tabWidth;
			},


			getTargetXPctg: function(index) {
				var totalTabs = this.model.get('controls').length;

				var targetX = index/totalTabs*100;

				if (targetX > 0) targetX *= -1;
				if (Capriza.isRTL) targetX *= -1;
				return targetX;
			},

			showTab: function(index, tabId, velocity, method) {

				if (index < 0) index = this.getIndexFromTabId(tabId);

				var targetHeader = $(this.$(".tab-header")[index]),
				    targetTab = $(this.$(".tab-content")[index]),
				    activeHeader = this.$(".tab-header.active"),
				    activeTab = this.$(".tab-content.active"),
				    curIndex = this.$(".tab-content").index(activeTab);

				if (curIndex === index) return;

				method = method || "";
				var targetX = this.getTargetXPxls(index);

				Dispatcher.trigger("pageView/tabChange", tabId);

				activeHeader.removeClass("active");
				targetHeader.addClass("active");

				activeTab.removeClass("active");
				targetTab.addClass("active");

				try {
					this.reportInteraction({
						element: "Tabs",
						interaction: "click",
						tabIndex: index,
						tabId: tabId,
						fromIndex: curIndex,
						controlPath: "#tab-header-" + tabId + " .header-div",
						additionalData: "Show tab using "+method
					});
				} catch (e){
					Logger.info("[UserInteraction] Exception on report Tabs navigate to tab interaction");
				}
				if (!window.isDesignerPreview) {
					var self = this;
					this.$tabsContainer.addClass('swiping');
					self.changeDisableSwipe(true);
					var duration =  velocity > 1 ? ($.fx.speeds._default / (velocity/2)) : $.fx.speeds._default;
					this.$tabsContainer.transition({ x: targetX+'px', duration: duration}, function(){
						self.changeDisableSwipe(false);
						$(this).removeClass('swiping');
					});

					this.positionSelectedIndicator(duration);
				}
				else {
					this.setSelectedTab(tabId);
				}



				Logger.debug("[Tabs] showTab: index=" + index + ", tabId=" + tabId +", using: "+ method);

				var id = targetHeader.attr("id");
				if (id) this.saveSelectedTabToUiState(id.replace("tab-header-", ""));
			}
			,
			addShowMore:Utils.noop,
			setYesMore:Utils.noop
		});

		// Finds elements to focus that are placed in active tab content
		function findFocusableInTab() {
			var result = $(":enabled, [tabindex]", $(".tab-content.active")).not(
				"[tabindex=-1]");

			return result;
		}

		// Finds elements to focus that are placed after the Tab View control
		function findFocusableAfterTabs() {
			var result =
				    $(":enabled, [tabindex]", $(".dock-bottom")).not("[tabindex=-1]");

			return result;
		}

		// Checks if the focus goes to an element in inactive tab, and if so, tries
		// to find another element to focus. If another element not found, the focus
		// remains in the same element.
		function focusLost(event) {
			var $hiddenTab =
				    $(event.relatedTarget).parents(".tab-content:not(.active)");

			if ($hiddenTab.length) {
				var $newFocus;

				// focus lost in tab headers - go into active tab or after tabs
				// focus lost in active tab - go to headers or after tabs
				if ($(this).is(".tabs-headers")) {
					$newFocus = findFocusableInTab();
					$newFocus.length || $newFocus.add(findFocusableAfterTabs());
				} else if ($.contains($(".tab-content.active")[0], this)) {
					$newFocus =
						$hiddenTab.index() < $(".tab-content.active").index()
							? $(".tabs-headers") : findFocusableAfterTabs();
				}

				// focus the found element, or stay in the same element
				($newFocus[0] || this).focus();
			}
		}

		Capriza.Views.Tab = Capriza.Views.Group.extend({
			_render: function(){
				_.each(this.model.get("controls"), this.addControl, this);
				this.$el.addClass("tab-content vertical-layout").attr("id", this.getUniqueControlId() || "");
				var self = this;
				if (Capriza.device.isMobile) {
					function fixContainerTop(tabsHeaderHeight){
						Dispatcher.off("Tabs/scrolled", fixContainerTop);
						if (self.model.parent.get('tabPosition') === 'top') {
							if (tabsHeaderHeight) {
								self.$el.css('padding-top', tabsHeaderHeight);
							} else {
								Logger.error("[Tabs] Header height is zero",null, null, " for "+ self.model.get("id"));
							}
						}
					}
					function fixHeaderPositions(){
						self.$el.off("scroll",fixHeaderPositions);
						var $headers = self.$el.parent().prev();
						$headers.css("position", "absolute");
						Dispatcher.trigger("Tabs/scrolled", $headers.height());

					}
					this.$el.on("scroll", fixHeaderPositions);
					Dispatcher.on("Tabs/scrolled", fixContainerTop);
				}

				if (Capriza.device.isDesktop) {
					$(":enabled, [tabindex]", this.$el).blur(focusLost);
				}
				return this.$el;
			},

			addShowMore:Utils.noop,
			setYesMore:Utils.noop,
			setKey:Utils.noop
		});

		Capriza.Views.ContextPage.prototype.currentSelectedTab = function() {
			var $selectedTab = this.$(".tab-header.active");
			return $selectedTab.length === 1 ? $selectedTab.data("tab-id") : undefined;
		};

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Bubble.js

try{
	(function() {
		Capriza.Views.Bubble = Capriza.Views.ClientButton.extend({

			initialize: function() {
				var self = this;

				this.onPageChange = this.onPageChange.bind(this);

				this.bubbleView =  new Capriza.Views.BubbleContent({model: this.model.get("controls")[0], page:this.options.page, button : this.$el});
				self.options.page.addView(this.model.get("controls")[0].get('id'), this.bubbleView);
				this.bubbleView.on('bubble/show', function(view){

					//inherited from uiControl, notifies the page that this control now blocks the entire page,
					//until "unblockPage" or "hideBubble" are called
					self.notifyBlockPage();

					self.trigger('bubble/show', view);
				}).on('bubble/hide', function(view){

					//notify the page the bubble no longer blocks the page.
					Capriza.Views.UiControl.prototype.unblockPage.apply(self);

					self.trigger('bubble/hide', view);
				});
			},

			_render: function() {
				var self = this;
				this.$el = Capriza.Views.ClientButton.prototype._render.call(this);
				this.$el.on("click", function() {
					var bubbleView = self.options.page.getView(self.model.get('controls')[0].get('id'));
					bubbleView.toggleBubble();
				}).addClass("bubble").attr("id", this.getUniqueControlId());
				this.bubbleView.render();
				this.setSeverity(this.model.get('severity'));
				//
				Dispatcher.on("page/change/after/callbackEnded page/controlAdded/after", this.onPageChange);

				return this.$el;
			},

			onPageChange: function() {
				Dispatcher.off("page/change/after/callbackEnded page/controlAdded/after", this.onPageChange);
				//auto show bubble only in these cases:
				//1. expanded = true
				//2. in case of notification (severity), the name shouldn't be 0 (there are at least 1 notification).
				//3. the bubble is not empty (the bubble content has controls)
				if(this.model.get('expanded') && !(this.model.get("severity") && this.model.get("name") == 0) && this.model.get("controls")[0].get("controls").length > 0) {
					//var shouldOpenImmediately = self.model.get('expanded') && e.fromPage.length > 0;
					if(this.shouldExpand()) {
						this.bubbleView.showBubble();
					}
				}
			},

			shouldExpand: function(){
				//auto show bubble only in these cases:
				//1. expanded = true
				//2. in case of notification (severity), the name shouldn't be 0 (there are at least 1 notification).
				//3. the bubble is not empty (the bubble content has controls)
				if (Capriza.isDesginerSnapShot) return;
				return this.model.get('expanded') && !(this.model.get("severity") && this.model.get("name") == 0) && this.model.get("controls")[0].get("controls").length > 0;
			},

			_destroy: function() {
				Dispatcher.off("page/change/after/callbackEnded", this.onPageChange);

				this.bubbleView._destroy();
			},

			replaceWith: function(otherView) {
				var newEl = otherView.render();
				this.$el.replaceWith(newEl);

				if (otherView.bubbleView) this.bubbleView.replaceWith(otherView.bubbleView);

			},

			setControls : function(controls) {
				this.bubbleView.setControls(controls);
			},

			update : function(attributes){
				Capriza.Views.UiControl.prototype.update.call(this, attributes);
				if(this.shouldExpand()) {
					this.bubbleView.showBubble();
				}
			},

			setSeverity : function(severity) {
				if(severity){
					this.$el.toggleClass("notif", true);

					this.$el.toggleClass("error-count", "ERROR" == severity );
					this.$el.toggleClass("warning-count", "WARNING" == severity );
					this.$el.toggleClass("info-count", "INFO" == severity || "NONE" == severity );

					if (this.model.get('name') !== "0") {
						this.setName('');
					}
					this.setIcon('icon-notifications-bell');
				}
			},

			setName : function(name) {
				if (this.model.get('severity')){
					if (!this.model.get('canBeEmpty')) {
						this.$el.toggleClass("hidden", this.model.get('name') == 0);
					}
					this.$el.attr('data-counter', this.model.get('name'));
					Capriza.Views.ClientButton.prototype.setName.call(this, '');
					this.setIcon('icon-notifications-bell');
				} else {
					Capriza.Views.ClientButton.prototype.setName.call(this, name);
				}

				Dispatcher.trigger("bubble/name/change", this);
			},

			getView: function(control) {
				if(control.get('type') == 'panel'){
					return new Capriza.Views.BubbleContent({model: control, page:this.options.page, button : this.$el});
				}
				return Capriza.Views.createView(control, this.options.page);
			},

			//This method is called from the page, when the page wants to close/clear "blocking" controls
			unblockPage: function(){
				this.bubbleView.hideBubble();
			}
		});

		// Pressing Escape hides the bubble
		function onKeyDown(bubbleContent, event) {
			if (event.key == "Escape") {
				bubbleContent.hideBubble();

				function f() {
					$(".value", bubbleContent.options.button).focus();
				}

				setTimeout(f, 300);
			}
		}

		function getSizeInInt(fromString) {
			return fromString ? parseInt(fromString) : 0;
		}

		Capriza.Views.BubbleContent = Capriza.Views.Panel.extend({

			className : "panel",

			initialize: function() {
				this.rendered = false;
				var self = this;
				this.options.getViewByModel = this.options.getViewByModel || this.getViewByModel;
				this.shieldClick = this.shieldClick.bind(this);
				this.arrowDefaultHeight = 12;
				if(this.model.get("controls")) {
					_.each(this.model.get("controls"), function (control) {
						self.options.page.addView(control.get("id"), Capriza.Views.createView(control, self.options.page));
					});
				}

				Dispatcher.on('miniBrowser/show bubbles/hide page/change/beforeTransition', function(){
					if(self.$wrapper.hasClass('active')) {
						self.hideBubble();
					}
				}, this);

				Dispatcher.on('control/action/end', function(control) {
					if (control.model.get("closeBubble") && this.$wrapper.hasClass('active') && control.model.isInControl(this.model)) {
						Logger.debug('Closing bubble due to clicking on ' + control.model.get("id"));
						setTimeout(function() { self.hideBubble(); },300);
					}
				}, this);
				Dispatcher.on('page/controlModified/after', this.restoreState, this);
			},

			restoreState : function(data) {
				if (this.model.isInControl(data.model) && this.loadFromPageState("showBubble")) this.showBubble();
			},

			_render: function() {
				var self = this;
				if(!this.rendered) {

					this.$el = Capriza.Views.Panel.prototype._render.apply(this, arguments);
					this.$innerGroup.addClass('scrolling-area');
					this.rendered = true;
					this.$arrow = $("<div class='arrow-wrapper'></div>");
					this.$arrowBorder = $("<div class='arrow-border'></div>");
					this.$wrapper = $("<div id='bubble-wrapper' class='bubble-content'></div>");
					this.$wrapper.append(this.$arrow).append(this.$el).append(this.$arrowBorder);
					this.$shield = $("<div class='global-shield bubble'>").append(this.$wrapper);

					// Create the debounce function to be used on window resize;
					this.debounceUpdateBubblePosition = _.debounce(this.updateBubble.bind(this), 25);

					if (Capriza.device.ios){
						this.$blocker = $('<div class="ios-prevent-propagation-scroll"></div>');
						this.$blocker.off('click').on('click', self.shieldClick);
						console.log("create scroll listner");

						this.$blocker.off('scroll').on('scroll', function (e) {
							e.preventDefault();
							this.scrollTop = 2;

						});

						this.$blocker.append($('<div style="min-height: calc(100% + 3px)"></div>'));
						this.$shield.prepend(this.$blocker);
						this.$wrapper.prepend(this.$blocker.clone(true));
					}

					this.$wrapper.css('position', 'absolute');

					this.onScroll = function(){
						self.hideBubble();
					};

					if (Capriza.device.isDesktop) {
						this.$wrapper.on("keydown", function (event) {
							onKeyDown(self, event);
						});
					}
				}
				return this.$el;
			},

			setMcStyle : function()  {
				Capriza.Views.UiControl.prototype.setMcStyle.call(this);
				this.setArrowStyle();
			},

			setArrowStyle : function() {
				var color = this.$wrapper.css('background-color');
				var borderColor = this.$arrow.hasClass('arrow-down') ? this.$wrapper.css('border-bottom-color') : this.$wrapper.css('border-top-color');

				if(color){
					this.$arrow.css('border-bottom-color', color);
					this.$arrow.css('border-top-color', color);
				}

				if(borderColor) {
					this.$arrowBorder.css('border-bottom-color', borderColor);
					this.$arrowBorder.css('border-top-color', borderColor);
				}
			},

			_destroy: function() {
				// Use this to detect page rotate and fix bubble position and
				window.removeEventListener("resize", this.debounceUpdateBubblePosition);
				if(this.$wrapper.hasClass('active')){
					this.$wrapper.removeClass("active");
					this.$shield.remove();
					this.saveToPageState("showBubble", true);
					var $headerOverlay = $('#header-overlay');
					$headerOverlay.removeClass('bubble');
					if (!$headerOverlay.hasClass("side-menu")) {
						$headerOverlay.off('click');
						$headerOverlay.removeClass('active');
					}
				}
				Dispatcher.off('page/controlModified/after', this.restoreState, this);
				Capriza.Views.Panel.prototype._destroy.apply(this, arguments);
			},

			replaceWith: function(otherView) {
				var showBubble = otherView.model.get('expanded') || this.loadFromPageState("showBubble") ||
					this.$wrapper.hasClass('active') || this.active;
				var newEl = otherView.render();
				this.$el.replaceWith(newEl);
				this.$el = newEl;
				otherView.$wrapper.append(this.$el);
				this.$shield.replaceWith(otherView.$shield);
				if(showBubble){
					otherView.showBubble();
					this.saveToPageState("showBubble", false);
				}
			},

			toggleBubble : function() {
				// don't do anything if bubble is opening or closing
				if (this.$shield.hasClass("animating")) return;
				if(this.isBubbleOpen()){
					this.hideBubble();
				} else {
					this.showBubble();

				}
			},

			isBubbleOpen : function(){
				return this.$wrapper.hasClass('active') || this.active;
			},

			setStyleSets: function() {
				if(this.model.get("styleSetIds")) this.$wrapper.addClass('ss-' + this.model.get("styleSetIds").join(" ss-"));
			},


			updateBubble: function(){
				var $realButton = $('.value', this.options.button);
				if(!window.isDesignerPreview && !window.designerLoaded) {
					if ($realButton) {
						if ($realButton[0].scrollIntoViewIfNeeded){
							$realButton[0].scrollIntoViewIfNeeded()
						} else {
							$realButton[0].scrollIntoView();
						}
					}
				}
				this.$wrapper.width($('.active.page').width());
				this.calculateBubblePosition(true);
			},

			showBubble: function(shouldOpenImmediately) {
				Logger.debug('showBubble called');
				try{
					this.reportInteraction({
						element: "Bubble",
						interaction: "click"
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report show bubble interaction");
				}
				if(!this.$wrapper.hasClass('active')) {
					this.active = true; // sometimes during animation we get a refresh event so we need indication bubble was visible
					this.options.button.addClass('active');
					var self = this;

					if ($('.global-shield.bubble').length == 1) {
						this.$shield = $('.global-shield.bubble');
					} else {
						$('.viewport').append(this.$shield);
					}

					window.addEventListener("resize", this.debounceUpdateBubblePosition);
					//this is just incase the bubble was closed while the side menu was open
					this.$shield.css("transform","");
					this.$shield.append(this.$wrapper);
					this.$wrapper.width($('.active.page').width());
					this.$shield.off('click').on('click', function (e) {
						if ($(e.target).hasClass('global-shield')) {
							e.preventDefault();
							e.stopPropagation();

							if (self.$wrapper.hasClass('bubble-content') && self.$wrapper.hasClass('active') && !self.$shield.hasClass("animating")) {
								self.hideBubble();
							}

						}
					});

					this.disableScrollingPropagation();
					//this.getClosestScrollingContainer().addClass("disabled");
					//$(".tabs-headers").addClass("disabled");

					if (!$('#header-overlay').length){
						$('.page.active').prepend($('<div id="header-overlay"/>'));
					}
					$('#header-overlay').addClass('active bubble').off('click', self.shieldClick).on('click', self.shieldClick);

					var bubbleDirection = this.calculateBubblePosition();
					this.setArrowStyle();
					self.trigger('bubble/show', self);
					this.saveToPageState("showBubble", true);

					if (shouldOpenImmediately){
						this.$shield.addClass('active');
					} else {
						this.$shield.off('transitionend').on('transitionend', function () {
							Logger.debug('Bubble is shown called');
							self.$shield.removeClass('animating');
						});

						this.$shield.addClass('active animating');
					}
					this.$arrowBorder.show();
					this.$arrow.show();
					if(window.isDesignerPreview || window.designerLoaded || shouldOpenImmediately){
						self.$wrapper.addClass("active");
					} else {
						var originX = parseInt(this.$arrow.css('left')) || (this.options.button[0].getBoundingClientRect().left + this.options.button[0].getBoundingClientRect().right)/2;
						var originY =self.$wrapper.height();
						if (bubbleDirection === 'bottom') originY = 0;
						this.$wrapper.css('transform-origin', originX+"px "+ originY+"px");

						if (!window.isDesignerPreview) {
							this.$wrapper.addClass('open-bubble-bounce-start');
						}

						this.$wrapper.addClass("active");

						this.$wrapper.one("animationend webkitAnimationEnd", function(e) {

							if (e.originalEvent.animationName === 'openbouncestart') {
								self.$wrapper.removeClass('open-bubble-bounce-start');
							}

						});
					}
					Capriza.device.isDesktop && Utils.focusContainer(this.$wrapper);
				}
			},

			shieldClick: function(e){

				if (!$("#side-menu.active"),length && e.pageX < 43 && e.pageY < 43) {
					var $sideBurder = $("#side-burger");
					if ($sideBurder.length){
						$sideBurder.click();
						return;
					}
				}
				if (this.isBubbleOpen() && !this.$shield.hasClass("animating")) {
					this.hideBubble();
				}
			},

			hideBubble: function(immediate) {
				if (!$("#"+this.$el[0].id).length){
					return;
				}
				try{
					this.reportInteraction({
						element: "Bubble",
						interaction: "click",
						controlPath: ".global-shield.bubble.active"
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report close bubble interaction");
				}
				Logger.debug('hideBubble called');
				this.active = false;
				this.options.button.removeClass('active');
				var self = this;
				this.saveToPageState("showBubble", false);

				window.removeEventListener("resize", this.debounceUpdateBubblePosition);
				function removeBubble(bubble, withAnimation) {
					Logger.debug('removeBubble called');
					bubble.$arrowBorder.hide();
					bubble.$arrow.hide();
					bubble.$wrapper.removeClass('active');
					bubble.$shield.removeClass('active animating');
					var $headerOverlay = $('#header-overlay');
					$headerOverlay.removeClass('bubble');
					if (!$headerOverlay.hasClass("side-menu")) {
						$headerOverlay.off('click');
						$headerOverlay.removeClass('active');
					}
					bubble.enableScrollingPropagation();

					bubble.$wrapper.css('max-height', '');
					bubble.$wrapper.removeClass('close-bubble').removeClass('open-bubble-bounce-start');

					bubble.$shield.detach();
					Dispatcher.trigger("bubble/close/end");

					self.trigger('bubble/hide', self);
				}
				if(window.isDesignerPreview || window.designerLoaded || immediate){
					removeBubble(this);
				} else {
					onHide(this);
				}

				function onHide(bubble) {

					bubble.$wrapper.one("animationend webkitAnimationEnd", function(e) {

						if (e.originalEvent.animationName === 'close') {
							removeBubble(bubble, true);
						}

					});
					bubble.$shield.addClass('animating');
					bubble.$shield.removeClass('active');
					bubble.$wrapper.removeClass('open-bubble-bounce-start');

					if (!window.isDesignerPreview) {
						bubble.$wrapper.addClass('close-bubble');
					}

				}
			},

			calculateBubblePosition : function() {
				var $realButton = $('.value', this.options.button);

				var bubbleDirection = this.layoutBubble();

				//arrow position
				var middlePoint = ($realButton.offset().left - $('.viewport').offset().left) + ($realButton.outerWidth(true) / 2); // calc middle of visual button
				var arrowLeft = middlePoint;

				// tweak left, effect only tablet because in mobile we use 100% width in tablet only 320px so we want to place bubble accordingly
				if(Capriza.device.isTablet) {
					var bubbleLeft = middlePoint - (this.$wrapper.outerWidth() / 2);
					var remainingLeft = $('.active.page')[0].getBoundingClientRect().right - bubbleLeft;

					//ToDo: need to have some margin between the page and the bubble
					// bubble exceed left
					if(bubbleLeft < 0){
						bubbleLeft = 0;
					} else if(remainingLeft < this.$wrapper.outerWidth()) { // bubble exceed right
						var leftOffset = this.$wrapper.outerWidth() - remainingLeft;
						bubbleLeft -= leftOffset;
					}
					arrowLeft -= bubbleLeft;

					this.$wrapper.css('left', bubbleLeft + 'px');
					//ToDo: need to make the bubble feet the modal page width
					if ($(".active.page-modal").length){
						arrowLeft += bubbleLeft;
						var modalRect = $(".active.page-modal")[0].getBoundingClientRect();
						this.$wrapper.css({'left': (Math.max(bubbleLeft,modalRect.left)  + 'px'), 'right': (modalRect.right + 'px')});
						arrowLeft -= Math.max(bubbleLeft,modalRect.left);
					}
				} else {
					//ToDo: need to make the bubble feet the modal page width
					if ($(".active.page-modal").length){
						var modalRect = $(".active.page-modal")[0].getBoundingClientRect();
						this.$wrapper.css({'left': (modalRect.left + 'px'), 'right': (modalRect.right + 'px')});
						arrowLeft -= modalRect.left;
					}
				}
				this.$arrow.css('left', arrowLeft);

				var border = this.handleBorderWidth();
				// if style has border width - handle here because it effects the arrow position
				if(border){
					arrowLeft -= border;
				}
				this.$arrowBorder.css('left', arrowLeft);

				return bubbleDirection;
			},

			layoutBubble : function() {
				var $page = $('.page.active .page-content'),
				    mainTop = $page.find('.header').outerHeight(true),
				    pageBounding = $page[0].getBoundingClientRect(),
				    spaceBelow = pageBounding.bottom - (this.options.button.offset().top + this.options.button.outerHeight()),
				    spaceAbove = this.options.button.offset().top - (pageBounding.top + mainTop);
				// reduce the border of the content and the wrapper
				var fixBorderPaddingSize = getSizeInInt(this.$wrapper.css("borderTopWidth")) + getSizeInInt(this.$wrapper.css("borderBottomWidth"));

				// If bubble can't fit below open it above
				if(!this.options.button.hasClass("notif") && spaceAbove > spaceBelow * 1.2){
					this.$wrapper.css('max-height', spaceAbove + 'px');

					this.$arrow.addClass('arrow-down');
					this.$arrowBorder.addClass('arrow-down');

					this.$wrapper.css('top', 'auto');
					// tweak bottom
					var bottom  = $('.viewport')[0].getBoundingClientRect().bottom - this.options.button.offset().top + this.arrowDefaultHeight;

					// TODO: $('.value',this.options.button) shows up too much (it was $('.real-button',this.options.button) ) - we need to refactor this code to have less copy/paste
					var margin = getSizeInInt($('.value', this.options.button).css('margin-top'));
					this.$wrapper.css('bottom', (bottom - margin) + 'px');
					this.$arrow.css('bottom', '-'+this.arrowDefaultHeight+'px');
					this.$arrow.css('top', 'auto');
					this.$arrowBorder.css('bottom', '-'+this.arrowDefaultHeight+'px');
					this.$arrowBorder.css('top', 'auto');
					this.$el.css('max-height' , (spaceAbove - this.arrowDefaultHeight - fixBorderPaddingSize)  +'px');
					return "top";
				}else {
					this.$wrapper.css('max-height', (spaceBelow - this.arrowDefaultHeight) + 'px');
					this.$wrapper.css('bottom', 'auto');
					this.$arrow.removeClass('arrow-down');
					this.$arrowBorder.removeClass('arrow-down');

					//tweak top
					var viewportTop = document.querySelector(".viewport").getBoundingClientRect().top;
					var top = this.options.button.offset().top - mainTop + this.options.button.height() + this.arrowDefaultHeight - viewportTop;

					// TODO: $('.value',this.options.button) shows up too much (it was $('.real-button',this.options.button) ) - we need to refactor this code to have less copy/paste
					var margin = getSizeInInt($('.value', this.options.button).css('margin-bottom'));
					this.$wrapper.css('top', (top - margin) + 'px');
					this.$arrow.css('top', '-'+this.arrowDefaultHeight+'px');
					this.$arrow.css('bottom', 'auto');
					this.$arrowBorder.css('top', '-'+this.arrowDefaultHeight+'px');
					this.$arrowBorder.css('bottom', 'auto');
					this.$el.css('max-height' , (spaceBelow - this.arrowDefaultHeight - fixBorderPaddingSize)  +'px');
					return "bottom";
				}
			},

			handleBorderWidth : function() {
				var borderWidth = this.$arrow.hasClass('arrow-down') ?  this.$wrapper.css('border-bottom-width') : this.$wrapper.css('border-top-width');
				var bubbleBorder =  this.$wrapper.css('border');

				if(borderWidth || bubbleBorder){
					var intWidth = bubbleBorder ? parseInt(bubbleBorder.match(/\d+/)[0]) : 1;
					var intWidthBorder = intWidth + (borderWidth ? parseInt(borderWidth.replace('px', '')) : 1);
					var width = (this.arrowDefaultHeight + intWidth) + 'px ';
					var widthBorder = (this.arrowDefaultHeight + intWidthBorder) + 'px ';
					var widthStr, widthBorderStr;

					if(!this.$arrow.hasClass('arrow-down')){
						widthStr = '0 ' + width + width ;
						widthBorderStr = '0 ' + widthBorder + widthBorder ;
						//need to add the wrapper border
						var top = parseInt(this.$arrow.css('top').replace('px','')) - intWidthBorder;
						this.$arrowBorder.css('top', top + 'px');
					} else {
						widthStr = width + width + '0 ';
						widthBorderStr = widthBorder + widthBorder + '0 ';
						//need to add the wrapper border
						var bottom = parseInt(this.$arrow.css('bottom').replace('px','')) - intWidthBorder;
						this.$arrowBorder.css('bottom', bottom + 'px');
					}
					this.$arrow.css('border-width', widthStr);
					this.$arrowBorder.css('border-width', widthBorderStr);
					return intWidth;
				}
			}

		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Notification.js

try{
	Capriza.Views.initWidget("notification", {

		severity: {
			"ERROR": { icon: "times-circle", color: "red" },
			"WARNING": { icon: "exclamation-circle", color: "orange" },
			"INFO": { icon: "check-circle", color: "blue" },
			"NONE": { icon: "times", color: "green" }
		},

		_create: function(){
			this.draw();
		},

		draw: function(){
			var severity = this.options.severity || "ERROR";
			var $icon = $("<i class='fa'></i>").addClass("fa-" + this.severity[severity].icon).css({ "color": this.severity[severity].color, "margin-right": "10px" });
			this.element.html(this.options.text || "").prepend($icon);
		},

		setText: function(){
			this.draw();
		},

		setSeverity: function(){
			this.draw();
		}

	});

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/RadioGroup.js

try{
	;(function () {
		Capriza.Views.RadioGroup = Capriza.Views.UiControl.extend({
			_render: function () {
				this.$el.attr("id", this.getUniqueControlId()).addClass("radiogroup");

				this.setItems(this.model.get("items") || []);

				return this.$el;
			},

			setItems: function(items) {
				var self = this;

				$('.radio-button', self.$el).remove();

				items.forEach(function (item, index) {
					var $itemEl = $("<div class='radio-button'></div>").attr("el-index", index).on("click", function (e) {
						var $el = $(this);
						self.updateSelected($el.attr("el-index"));
						$('.radio-button', self.$el).removeClass("selected");
						$el.addClass("selected");
					}).appendTo(self.$el);

					if (item.options) {
						for (var option in item.options) {
							$itemEl.attr(option, item.options[option]);
						}
					}

					$itemEl.css({"width": (90 / items.length) + '%'});

					$itemEl.toggleClass("disabled", !!item.disabled);

					$('<span class="styleable-text first-text">' + item.text + '</span>').appendTo($itemEl);
					if (item.text2) {
						$('<span class="styleable-text second-text">' + item.text2 + '</span>').appendTo($itemEl);
					}
					if (item.text3) {
						$('<span class="styleable-text third-text">' + item.text3 + '</span>').appendTo($itemEl);
					}
				});
			},

			getSelectedIndex: function () {
				return $('.radio-button.selected', this.$el).attr("el-index");
			},

			setSelectedIndex: function (index) {
				$('.radio-button', this.$el).each(function () {
					var $item = this;
					if ($item.getAttribute("el-index") == index) {
						$item.classList.add("selected");
					}
					else {
						$item.classList.remove("selected");
					}
				});
			},

			_post: function () {
				var selectedIndex = this.model.get("selectedIndex");
				this.setSelectedIndex(selectedIndex);
			},

			updateSelected: function (selectedIndex) {
				this.model.api.setSelectedIndex(selectedIndex);
			}
		});

		Capriza.Views.ClientRadioGroup = Capriza.Views.RadioGroup.extend({
			updateSelected: function (selectedIndex) {
				var selectedItem = $('.radio-button[el-index="' + selectedIndex + '"]', this.$el);
				Dispatcher.trigger("radioGroup/selectionChanged", {selected: selectedItem, mc: this.model.get("id")});
			}
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/RotatingTablePanel.js

try{
	;(function () {
		Capriza.Views.RotatingTablePanel = Capriza.Views.Panel.extend({
			_post: function () {
				_.bindAll(this, "refreshSelectedColumn", "updateSelectedColumn");

				this.$el.addClass("rotating-table-panel");

				var radioGroup = this.getRadioGroup();

				radioGroup.$el.sticky();

				Dispatcher.on("radioGroup/selectionChanged", this.updateSelectedColumn);

				radioGroup.setSelectedIndex(0);

				document.addEventListener('DOMNodeInserted', this.refreshSelectedColumn);
			},

			_destroy: function () {
				Dispatcher.off("radioGroup/selectionChanged", this.updateSelectedColumn);
				document.removeEventListener('DOMNodeInserted', this.refreshSelectedColumn);
			},

			refreshSelectedColumn: function () {
				var radioGroup = this.getRadioGroup();
				if (!radioGroup) return;
				radioGroup.updateSelected(radioGroup.getSelectedIndex());
			},

			updateSelectedColumn: function (props) {
				var radioGroup = this.getRadioGroup();
				var radioGroupMcId = radioGroup.model.id;

				if (radioGroupMcId !== props.mc) return;

				var rotatingColumnIds = this.model.get("rotatingColumnIds") || [];
				var selectedColumnId = props.selected.attr("columnMcId");
				var selectedPlaceholderId = props.selected.attr("placeholderMcId");
				var columnsToHide = rotatingColumnIds.filter(function (column) {
					return column.id !== selectedColumnId && column.placeholderId !== selectedPlaceholderId;
				});

				this.hideColumns(columnsToHide);
				this.showColumns([selectedColumnId, selectedPlaceholderId]);
			},

			getRadioGroup: function () {
				var controls = this.options.page.getViews(this.model.get("controls") || []);
				return controls[0];
			},

			getTable: function () {
				var controls = this.options.page.getViews(this.model.get("controls") || []);
				return controls[1];
			},

			hideColumns: function (columns) {
				columns.forEach(function (column) {
					$(".table [data-mctemplid='" + column.id + "']", this.$el).toggleClass("hiddenColumn", true);
					$(".table [data-mctemplid='" + column.placeholderId + "']", this.$el).toggleClass("hiddenColumn", true);
				});
			},

			showColumns: function (columns) {
				columns.forEach(function (columnMcId) {
					$(".table [data-mctemplid='" + columnMcId + "']", this.$el).toggleClass("hiddenColumn", false);
				});
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Mapping.js

try{
	;(function() {
		Capriza.Views.modelToView = {
			group: Capriza.Views.Group,
			textbox: Capriza.Views.Textbox,
			passwordbox: Capriza.Views.Passwordbox,
			checkbox: Capriza.Views.Checkbox,
			logincheckbox: Capriza.Views.LoginCheckbox,
			datepickerInput: Capriza.Views.DatePickerInput,
			calendarInput: Capriza.Views.CalendarInput,
			datepickerButton: Capriza.Views.DatePickerButton,
			calendarButton: Capriza.Views.CalendarButton,
			button: Capriza.Views.Button,
			lookup: Capriza.Views.Dropdown,
			listbox: Capriza.Views.Dropdown,
			listboxmulti: Capriza.Views.Dropdown,
			popup: Capriza.Views.Dropdown,
			menu: Capriza.Views.Dropdown,
			link: Capriza.Views.Link,
			combobox: Capriza.Views.Dropdown,
			autocomplete: Capriza.Views.Dropdown,
			content: Capriza.Views.Content,
			table: Capriza.Views.Table,
			tabular: Capriza.Views.Tabular,
			main: Capriza.Views.Panel,
			file: Capriza.Views.File,
			image: Capriza.Views.Image,
			image_link: Capriza.Views.ImageLink,
			panel: Capriza.Views.Panel,
			swipeActions: Capriza.Views.Panel,
			onoffswitch3: Capriza.Views.OnOffSwitch3,
			tabController: Capriza.Views.TabController,
			tab: Capriza.Views.Tab,
			bubble: Capriza.Views.Bubble,
			clientbutton: Capriza.Views.ClientButton,
			clientlink: Capriza.Views.ClientLink,
			box: Capriza.Views.Content,
			carousel: Capriza.Views.Carousel,
			gauge: Capriza.Views.Gauge,
			series: Capriza.Views.Series,
			pie: Capriza.Views.Pie,
			clickAction: Capriza.Views.ClickAction,
			rotatingTablePanel : Capriza.Views.RotatingTablePanel,
			radioGroup: Capriza.Views.RadioGroup,
			clientRadiogroup: Capriza.Views.ClientRadioGroup
		};

		Capriza.Views.getViewByModel = function(model) {
			var type = Capriza.Views.modelToView[model.get('type')];
			if (type) return type;

			if (model.get("controls")) {
				return Capriza.Views.GenericCollection;
			} else {
				return Capriza.Views.GenericView;
			}
		};
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/views/Unimessage.js

try{
	/**
	 * Created by Lev Weingarten on 8/2/2016.
	 */
	;(function () {
		// default offsets of unimessage
		var defaultPosition = {right: 15, bottom: 15, left: 15};

		Capriza.Views.Unimessage = Backbone.View.extend({
			tagName: "div",
			className: "unimessage",
			events: {"click .um-action>.mainAction": "actionButtonClicked",
				"click .um-action>.extraAction": "extraActionButtonClicked"},

			// Renders Unimessage element
			render: function () {
				var model = this.model;
				function showElement(isVisible, cssName){
					$element.toggleClass(cssName, isVisible);
					isVisible && $element.removeClass("um-hasOnlyIcon");
				}
				var $element = this.$el.addClass("with-animation");
				$element.html(Handlebars.templates.unimessage(model.toJSON()));

				$element.removeClass(function (index, css) {
					return (css.match (/(^|\s)um-type-\S+/g) || []).join(' ');
				});
				$element.addClass("um-hasOnlyIcon um-type-" + model.get("type"));

				showElement(!!model.get("messageText"), "um-hasMessage");
				showElement(!!model.get("detailText"), "um-hasDetail");
				showElement(!!model.get("action"), "um-hasAction");
				if (model.get("type") == "progress"){
					$element.addClass("icon-animation");
				} else {
					$element.removeClass("um-hasOnlyIcon");
				}
				if (model.get("inSplash")){
					$element.addClass("splash-message");
				} else {
					$element.removeClass("splash-message");
				}
				// store a reference to View object
				$element.data("view", this);

				return this;
			},

			// Shows Unimessage
			show: function () {
				var $v = this.render(),
				    self = this;
				if (!$v || $v.length == 0){
					return;
				}
				$v = $v.$el;
				Logger.debug("[Loading-Message] Unimessage text: " + this.model.get("messageText") + ", type: "+ this.model.get("type"));

				if (!$v.hasClass("visible")){
					$v.appendTo("#cprz");
					$v.addClass("visible");
				}

				return this;
			},

			update: function(options, immediateShow){
				// If there is no el or the el was removed or is invisible don't update
				if (this.isHidden()){
					return;
				}
				this.model.set(options);
				if (immediateShow) {
					this.show();
				}
				return this;
			},

			// Hides and removes Unimessage
			hide: function (immediateHide) {
				Utils.unimessageTimeout && clearTimeout(Utils.unimessageTimeout);
				Logger.debug("[Loading-Message] Unimessage hide: " + this.model.get("messageText") + ", type: "+ this.model.get("type"));

				if (immediateHide){
					this.$el.remove();
				} else {
					this.$el.on(Utils.transitionEnd, this.onHideEnd.bind(this));
					this.$el.removeClass("visible");
					// add after animation end
					this.hideTimeout = setTimeout(this.onHideEnd.bind(this), 500);
				}
			},
			isHidden: function(){
				return !this.$el.length || (this.$el[0].compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED) || !this.$el.hasClass("visible")
			},

			onHideEnd: function(){
				this.hideTimeout && clearTimeout(this.hideTimeout);
				this.$el.remove();
			},

			// Calls model action
			actionButtonClicked: function () {
				var ac = this.model.get("action");
				ac();
			},
			// Calls model action
			extraActionButtonClicked: function () {
				var ac = this.model.get("extraAction");
				ac();
			}
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/PasscodeWidget.js

try{
	/*!
 * jQuery UI Widget-factory plugin boilerplate (for 1.8/9+)
 * Author: @addyosmani
 * Further changes: @peolanha
 * Licensed under the MIT license
 */

	;
	(function ($, window, document, undefined) {

		const DEFAULT_MAX_ATTEMPTS = 5;
		var countAttempts = 0;

		$.widget("capriza.passcode", {


			//Options to be used as defaults
			options: {
				mandatory: false,
				policy: "",
				title: 'Enter Passcode',
				verifyPasscode: "",
				digits: 4,
				create:false,
				interval: 0,
				attempts : DEFAULT_MAX_ATTEMPTS
			},


			_template: function () {
				return  $('<div> ' +
					'           <div class="top-header">      ' +
					'         <button>' +
					'<i class="icon-remove-sign icon-2x"></i>' +
					'</button>' +
					'</div>  ' +
					' <h1>                Enter Passcode                </h1>       ' +
					'     <input type="tel" class="numeric-keyboard"> <div class="focus-changer"></div><input type="password" class="passcode-view">        ' +
					'       <div class="to-go">                4 digits left                </div>     ' +
					'           <div class="policy">                </div>          ' +
					'      </div>')
			},

			_create: function () {
				var $template = this._template();

				this.$togo = $template.find('.to-go');
				this.$numericKeyboardInput = $template.find('.numeric-keyboard');
				this.$focusChanger = $template.find('.focus-changer');
				this.$inputView = $template.find('.passcode-view');
				this.element.append($template);
				var _this = this;

				function changeFocusToNumeric() {
					_this.$numericKeyboardInput.focus();
					_this.trackInput();
				}

				_this.$focusChanger.one('click', changeFocusToNumeric);

				this.$numericKeyboardInput.blur(function(){
					_this.$focusChanger.one('click', changeFocusToNumeric);
					console.log('numeric-keyboard is blurred');
					_this.stopTrackingInput();
				});

				this.$inputView.focus(function(){_this.$numericKeyboardInput.focus()});
			},

			reset: function () {
				this.$numericKeyboardInput.val('');
				this.$inputView.val('');
				this.$togo.text(this.options.digits + " digits left");
			},

			trackInput: function(){
				var _this = this;
				this.interval = setInterval(function(){
					if (_this.$inputView.val().length != _this.$numericKeyboardInput.val().length) {
						var stars = "";
						for (var i = 0; i < _this.$numericKeyboardInput.val().length; i++) {
							stars+='*';
						}

						_this.$inputView.val(stars);
						_this.updateToGo();
						if (_this.howManyToGo() === 0) {
							_this.onInputEnds();
						}
					}
				}, 16);
			},

			stopTrackingInput: function(){
				clearInterval(this.interval);
			},

			updateToGo: function(){
				var toGo = this.howManyToGo();

				if (toGo > 0) {
					if (toGo == 1) {
						this.$togo.text(toGo + " digit left");
					} else {
						this.$togo.text(toGo + " digits left");
					}
				}
			},

			howManyToGo: function(){
				return this.options.digits - this.$numericKeyboardInput.val().length;
			},

			onInputEnds: function(){
				var passcode = this.$numericKeyboardInput.val();

				if (this.options.verifyPasscode) {

					if (this.options.verifyPasscode == passcode) {
						countAttempts = 0;
						Utils.savePasscode(SharedUtils.readCookie('userId'), passcode);
						Dispatcher.trigger('passcode/hide');

						this.$numericKeyboardInput.blur();

					} else {
						this._mismatchHandler();

					}

				} else {
					this.options.origTitle = this.options.title;
					this._setOptions({title: 'Verify Passcode', verifyPasscode: passcode});
				}
			},

			_mismatchHandler:function(){
				var mismatchOptions={'title': this.options.origTitle || this.options.title};
				if(this.options.create){
					countAttempts = 0;
					mismatchOptions.verifyPasscode="";
				}
				else {
					this.reset();
					if (semver.gte(_urlParams.cordova, "11.0.0")){
						countAttempts++;
						var self = this;
						if (countAttempts < self.options.attempts) {
							setTimeout(function () {
								navigator.notification.alert(countAttempts + " of " + self.options.attempts + " attempts, please try again.", function(){}, "Incorrect Passcode");
							}, 0);
						}
						else {
							setTimeout(function () {
								navigator.notification.alert("You have been logged out due to too many failed attempts.", function(){
									countAttempts = 0;
									Capriza.Capp.messenger.emit("passcodeFail");
								},"Incorrect Password");
							}, 0);
						}
					}
					else {
						setTimeout(function () {
							navigator.notification.alert("Passcode mismatch, please try again.", function(){}, "Incorrect Passcode");
						}, 0);
					}
				}

				this._setOptions(mismatchOptions);
			},
			_setOptions: function (options) {

				this.options = $.extend(this.options, options);
				this._superApply(arguments);
			},
//        Respond to any changes the user makes to the
//        option method
			_setOption: function (key, value) {


				switch (key) {
					case 'title':
						this.element.find('h1').text(value);
						break;
					case 'mandatory':
						if (value) {
							this.element.find('.top-header button').hide();
						} else {
							this.element.find('.top-header button').show();
						}
						break;
					case 'policy':
						if (value) {
							this.element.find('.policy').text(this.options.policy);
						}


						break;
					case 'verifyPasscode':

						this.reset();

						break;
				}


				this._superApply(arguments);
			}
		});

	})(jQuery, window, document);
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/Passcode.js

try{
	(function () {
		Dispatcher.on("runner/run", function (appData) {
			var _this = new Capriza.Views.PasscodeView();
			_this.render();
		});

		Capriza.Views.PasscodeView = Backbone.View.extend({
			id: 'passcode-page',
//        className: 'page',
			//... is a list tag.
			// Cache the template function for a single item.
//        template: Handlebars.templates.passcode,
//      className: 'zapp',
			// The DOM events specific to an item.
			reset: function (options) {
				options = _.extend({
					verifyPasscode: ""
				}, options);
				var localPasscode = Utils.loadPasscode(SharedUtils.readCookie('userId'));
				if (localPasscode) {
					this.$el.passcode({'verifyPasscode': localPasscode});
				}
				else if (options.verifyPasscode) {
					this.$el.passcode({'verifyPasscode': options.verifyPasscode});
				}
			},

			events: {
//            'click .top-header button': function (e) {
//                Dispatcher.trigger('passcode/hide');
//            }
			},

			initialize: function () {
				_.bindAll(this);
				Dispatcher.on('passcode/show', this.show);
				Dispatcher.on('passcode/hide', this.hide);
				this.render();
			},

			render: function () {
				this.$el.passcode().appendTo(".viewport");
				this.$el.css({y: "100%"});
				return this;
			},
			show: function (options) {
				var _this = this;
				this.reset(options);
				$(document.activeElement).blur();
				this.$el.prop('disabled', false);
				$('input',this.$el).prop('disabled', false);
				this.$el.addClass('active transitioning');
				this.$el.transition({y: 0}, function () {
					_this.$el.removeClass('transitioning');
				});
			},
			hide: function () {
				this.reset();
				this.$el.addClass("transitioning");
				var _this = this;
				this.$el.transition({y: "100%"}, function () {
					_this.$el.removeClass('active transitioning');
					$('.passcode-view').val("");
				});
			}
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/handlebars-helpers.js

Handlebars.registerHelper('prettyDate', function (object) {
	return new Handlebars.SafeString(
		humaneDate(object)
	);
});

Handlebars.registerHelper("i18n", function (textKey) {
	var result = Capriza.translator.getText(textKey);

	return result;
});


//! Source: javascripts/Debug.js

try{
	(function () {

		if (_urlParams.debug || location.hash.indexOf("local;") > -1) window.debugMode = true;

		if (!window.debugMode) return;

		var debug=window.debug = $.extend({}, window.debug);


//    intercept Dispatcher trigger
		var debugKeyHolder = {};
		var originalTrigger = Dispatcher.trigger;

		// Dispatcher.trigger = function () {
		//     var blacklist = ["uiControl/rendered"];
		//     var whitelist = ["app/loaded ", "app/init", "runner/run", "runner/appStarted", "mobile/active"];

		//     if (_urlParams.debug) {
		//         if (whitelist.indexOf(arguments[0]) > -1) {
		//             logger.error(arguments[0]);
		//         }
		//         else if (blacklist.indexOf(arguments[0]) == -1) {
		//             logger.log(arguments[0]);
		//         }
		//     }
		//     if (_urlParams.debug && blacklist.indexOf(arguments[0]) == -1) {
		//         take(arguments[0]);

		//         var key = arguments[0];
		//         var app = {};
		//         if (window.appData) {
		//             app = {
		//                 id: appData.app.id,
		//                 name: appData.app.name,
		//                 token: appData.app.token,
		//                 sessionId: appData.session_id
		//             }
		//         }

		//         logger.debug(JSON.stringify({event: key, time: new Date(), app: app}))

		//     }

		//     originalTrigger.apply(this, arguments);
		// };
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/Router.js

try{
	;(function() {
		window.Router = (function() {
			var AppRouter = Backbone.Router.extend({
				routes: {}
			});

			return new AppRouter();
		})();

		Dispatcher.trigger("router/created");
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/Login.js

try{
	(function () {
		var runCount=0;
		var takeLogin;
		Dispatcher.on("login/show", function () {
			if(!takeLogin){
				takeLogin = take("loginEvent", {async: true, manualSend: true});
			}

			if (!view) {
				view = new LoginView({ model: Capriza.loginModel });
			}
			view.render();

		});
		var view;


		var LoginView = Capriza.Views.PageView.extend({
			id: "login-page",
			className: "cover-page ignores-header",
			ignoresHeader: true,
			animate: !!Capriza.device.android,
			events: {
				"click button": "doLogin",
				"keypress input": "almostDoLogin"
			},

			_render: function () {

				var templateData = {
					title: "Capriza Login", // this.model.get("title"),
					socialLogin: true,
					linkedinUrl: Config.apiUrl + "/auth/linkedin",
					linkedinIconUrl: Config.apiUrl + "/images/authbuttons/linkedin_64.png"
				};

				Dispatcher.trigger("header/hide");

				this.$el.html($(Handlebars.templates['login-page'](templateData)));

				if (this.animate) {
					$.capriza.changePage(this.$el, { transition: "slide", notInStack: true });
				} else {
					$.capriza.changePage(this.$el, { transition: "none", notInStack: true });
				}

				this.$el.find("form").submit(function () {
					return false;
				});
				return this;
			},

			leave: function () {

				if (this.animate) {
					$.capriza.backPage({ transition: "slide", fromPage: this.$el, notInStack: true });
				} else {
					$.capriza.backPage({ transition: "none", fromPage: this.$el, notInStack: true });
				}

				Dispatcher.trigger("header/show");
			},

			cleanup: function () {
				this.$("input").val("");
				this.$(".error-message").text("");
			},

			doLogin: function () {
				this.$el.find("form").find("input").blur();
				//$.capriza.showLoadingCenter();
				var _this = this;
				Api.login({
					email: this.$("#login-email").val(),
					password: this.$("#login-password").val(),

					complete: function () {
						//$.capriza.hideLoadingCenter();
					},

					success: function (resp) {
						_this.model.set("user", resp["user"]);
						_this.cleanup();
						_this.leave();

						if(runCount==0){
							Runner.runSession();
							runCount++;
						}
						takeLogin();
					},

					failure: function (resp) {
						var errorCode = resp.error_codes && resp.error_codes[0];
						if (errorCode == errorCodes.AUTH_NOT_CONFIRMED.id) {
							Dispatcher.trigger("confirmation/show");
							_this.cleanup();
							_this.leave();
						} else {
							_this.$(".error-message").text(resp["errors"]);
							_this.model.set("user", null);
						}


					}
				});
			},

			almostDoLogin: function (e) {
				if (e.keyCode == 13)
					this.doLogin();
			}

		});

		Capriza.Model.Login = Backbone.Model.extend({

			initialize: function () {
				this.set("user", { pending: true });
				this.checkToken();
			},

			checkToken: function () {
				var _this = this;
				Api.login({
					success: function (resp) {
						_this.set("user", resp["user"]);
					},

					failure: function (resp) {
						_this.set("user", null);
					}
				});
			}

		});

	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/Confirmation.js

try{
	(function () {
		Dispatcher.on("confirmation/show", function () {

			if (!view) {
				view = new ConfirmationView({model: Capriza.loginModel});
			}
			view.render();

		});
		var view;

		var ConfirmationView = Capriza.Views.PageView.extend({
			id:"confirmation-page",
			className:"cover-page ignores-header",
			ignoresHeader:true,
			animate:!!Capriza.device.android,
			events:{
				"click button":function(){Utils.reload()}
			},

			_render:function () {

				Dispatcher.trigger("header/hide");
				//$.capriza.hideLoadingCenter();

				this.$el.html(Handlebars.templates['confirmation-page']());

				if (this.animate) {
					$.capriza.changePage(this.$el, { transition: "slide", notInStack: true });
				} else {
					$.capriza.changePage(this.$el, { transition: "none", notInStack: true });
				}

				return this;
			},

			leave:function () {

				if (this.animate) {
					$.capriza.backPage({ transition: "slide", fromPage: this.$el, notInStack: true });
				} else {
					$.capriza.backPage({ transition: "none", fromPage: this.$el, notInStack: true });
				}

				Dispatcher.trigger("header/show");
			}


		});

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/Message.js

try{
	(function () {
//    Dispatcher.on("message/show", function (options) {
//
//
//        _this.options = $.extend({}, {
//            pageId:"message-page",
//            topHeader: '',
//            bottomHeader: '',
//            message: '',
//            buttonText: 'Okay',
//            buttonStyle: '',
//            buttonAction:function(){},
//            renderAction:function(){}
//
//        }, options);
//
//        if (!view) {
//            view = new MessageView({});
//        }
//        view.render(options);
//
//
//    });


		var view;
		var _this = this;

		var MessageView = Capriza.Views.PageView.extend({

			id: "message-page",
			className: "cover-page ignores-header",
			ignoresHeader: true,
			animate: !!Capriza.device.android,
			events: {

			},

			_render: function () {

				Dispatcher.trigger("header/hide");

				this.$el.html(Handlebars.templates['message-page'](_this.options));
				this.$el.find("button").click(_this.options.buttonAction);

				if (this.animate) {
					$.capriza.changePage(this.$el, { transition: "slide", notInStack: true });
				} else {
					$.capriza.changePage(this.$el, { transition: "none", notInStack: true });
				}
				_this.options.renderAction();
				return this;
			},

			leave: function () {

				if (this.animate) {
					$.capriza.backPage({ transition: "slide", fromPage: this.$el, notInStack: true });
				} else {
					$.capriza.backPage({ transition: "none", fromPage: this.$el, notInStack: true });
				}

				Dispatcher.trigger("header/show");

			}


		});

	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/ErrorPage.js

try{
	(function() {
		var NoPrivateRuntimeView = Capriza.Views.PageView.extend({
			_render: function() {
				this.$el.attr("id", "no-private-runtime-page");
				this.addContent(Handlebars.templates["noPrivateRuntime"]);
			}
		});

		var view;

		Dispatcher.on("runner/noPrivateRuntime", function() {
			view || (view = new NoPrivateRuntimeView());
			view.render().show();
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/Identity.js

try{
	(function() {
		if (Utils.caprizaMode === "ShellMode") return;

		function hideLoadingMessage(){
			Utils.hideLoading();
			Utils.hideUnimessages();
		}

		Dispatcher.on("identity/host/logout",function(host){
			var msg = Capriza.translator.getText("signingOut");
			setTimeout(function(){Utils.reload(msg)}, 0);
			Dispatcher.on('identity/host/logout/dataRemoved', function(){Utils.reload(msg)});
		});

		function prepareAndShowHeader(parent) {

			if (!this.$headerEl){
				this.$headerEl = $(".page.active .panel-type-header.header");
				if (!this.$headerEl.length) {
					var zappName = window.appData && window.appData.app_name;
					this.$headerEl = $('<div class="panel horizontal-layout has-dock group dock-top floating-bar panel-type-header header ui-control ss-dss_global ss-dss_header ss-dss_grouping_grow ss-dss_primBgCol active"></div>');
					this.$headerEl.append($('<div class="content ui-control ss-dss_global ss-dss_no_margin_child_content ss-dss_header_any ss-dss_header_square"><div class="value"></div></div>'));
					this.$headerEl.append($('<div class="content ui-control ss-dss_global ss-dss_no_margin_child_content ss-dss_primBgCol_content ss-dss_header_any ss-dss_text_overflow ss-dss_grow ss-dss_center_grow"><div class="value">' + zappName + '</div></div>'));
					this.$headerEl.append($('<div class="panel groupEmpty horizontal-layout group panel-type-inTemplate ui-control ss-dss_global ss-dss_no_margin_child_panel ss-dss_primBgCol_panel ss-dss_header_space ss-dss_header_any"> <div class="grouping"></div></div>'));
					this.$headerEl.append($('<div class="content ui-control ss-dss_global ss-dss_no_margin_child_content ss-dss_primBgCol_content ss-dss_header_any ss-dss_header_square"> <div class="value"></div></div>'));
					parent.prepend(this.$headerEl);
				}
			}
			Dispatcher.trigger('sideburger/show', this.$headerEl);
		}

		Capriza.IdentityWidget = {};
		Capriza.IdentityWidget.Base = {

			initialize: function(identityPageView, identityData) {
				this.pageView = identityPageView;
				this.data = identityData;
			},

			create: function(control) {
				var childEl = this._create(control);

				this.appendToPage(childEl);

			},

			appendToPage: function($elToAppend) {
				this.pageView.$(".fields").append($elToAppend);
			},

			getTextValueForID: function(controlId) {

				var controlIndex;

				if (!this.data.get('usernameMapping')) return;

				for (var i = 0; i < this.data.get('usernameMapping').length; i++){
					if (this.data.get('usernameMapping')[i] === controlId) {
						controlIndex = i;
					}
				}

				if (controlIndex === 0){
					return this.data.get('username');
				}
				else if (controlIndex === 1) {
					return this.data.get('username2');
				}
				else if (controlIndex === 2) {
					return this.data.get('username3');
				}
				else {
					return '';
				}


			}
		};
		Capriza.IdentityWidget.Image = _.extend({

			_create: function(control) {
				this.pageView.$('#identity-image').attr('src', control.get('src'));
			},

			update: function(control) {
				this.create(control);
			}
		}, Capriza.IdentityWidget.Base);

		Capriza.IdentityWidget.Textbox = _.extend({

			_create: function(control) {

				var controlId = control.get('id'), currValue = this.getTextValueForID(controlId) || control.get('text');

				var templateData = {
					klass: "labeled",
					id: controlId,
					name: control.get('name'),
					value: currValue
				};

				return $(Handlebars.templates["identity-textbox"](templateData));
			},

			update: function(control) {
				//Add update code here
			}
		}, Capriza.IdentityWidget.Base);

		Capriza.IdentityWidget.Password = _.extend({

			_create: function(control) {

				var controlId = control.get('id'), currValue = this.data.get('password') || control.get('text');

				var templateData = {
					klass: "labeled",
					id: controlId,
					name: control.get('name'),
					value: currValue
				};

				return $(Handlebars.templates["identity-passwordbox"](templateData));
			},

			update: function(control) {
				//Add update code here
			}
		}, Capriza.IdentityWidget.Base);

		Capriza.IdentityWidget.Listbox = _.extend({

			_create: function(control) {

				var controlId = control.get('id'), currValue = this.data.listbox;

				var templateData = {
					klass: "labeled",
					id: controlId,
					name: control.get('name'),
					options: Object.keys(control.get('items')).map(function(key) {

						return {
							optionText: control.get('items')[key],
							optionValue: key,
							selected: key=== currValue && currValue.toString() ? 'selected': '' };
					})
				};

				return $(Handlebars.templates["identity-listbox"](templateData));
			},

			update: function(control) {

				var optionsHTML = "";

				_.each(control.get('items'), function(key, i) {

					optionsHTML += "<option value="+i+">"+key+"</option>";
				});

				this.pageView.$('#'+control.get('id')).html(optionsHTML);

			}
		}, Capriza.IdentityWidget.Base);

		Capriza.IdentityWidget.Content = _.extend({

			_create: function(control) {

				var currValue = $(control.get('value')).text();

				var templateData = {
					value: currValue
				};

				return $(Handlebars.templates["identity-content"](templateData));
			},

			update: function(control) {
				//Add update code here
			}
		}, Capriza.IdentityWidget.Base);

		Capriza.IdentityWidget.Link = _.extend(Capriza.IdentityWidget.Base, {

			_create: function(control) {

				var $el = $('<div class="ui-control"></div>');

				$el.link(control.toJSON()).on('link_click', function(){
					control.api['click'];
				});

				return $el;

			},

			appendToPage: function($elToAppend) {
				this.pageView.$("form").append($elToAppend);
			},

			update: function(control) {
				//Add update code here
			}
		});



		Dispatcher.on("app/init", function() {

			Capriza.Model.IdentityPage = Capriza.Model.Page.extend({
				initialize: function() {
					var self = this;
					var presentationControl = this.get('presentationControl');

					var controls = presentationControl && presentationControl.controls;
					if (controls) {
						_.each(controls, function(jsonControl) {
							var control = Capriza.Model.Control.getById(jsonControl.get('id'));
							control && control.addPage(self);
						});
					}

				},

				controlChanged: function(control) {

					this.trigger("identityPage/controlChanged", control);

				}
			});

			/**
			 * Override the default implementation of returning an empty object (as defined in capriza-api-1.0.0.js)
			 */
			Capriza.getIdentity = function(callback, event) {

				window.appData = (window.appData || {});
				appData.identity=event;
				Capriza.LoginManager.loggedInHosts[event.host] = false;
				Capriza.LoginManager.credentialsSavedForHosts[event.host] = false;
				var credentials = Capriza.LoginManager.getSavedCredentialsForType(Capriza.LoginManager.credentialsTypes.LOGIN1_KEYS ,event.host);
				if (credentials && credentials.password && !event.prevInvalid && event.host && appData.xkcd && !event.canLogin && event.count <= 1) {
					Capriza.splashRenderAuthMessage && Capriza.splashRenderAuthMessage(Capriza.translator.getText(Capriza.translator.ids.authenticating), {fontColor: '#000000', isError: false});
					Capriza.LoginManager.credentialsSavedForHosts[event.host] = true;
					Dispatcher.trigger('splash/setTimeout');
					callback(credentials, true);

				} else {

					if (event.presentationControl) {

						//just for the sake of initialization...
						var root = new Capriza.Model.Control(event.presentationControl);
					}

					var page = new Capriza.Model.IdentityPage(event);

					if (view) {
						Capriza.clearIdentity();
					}
					window.scrollTo(0,0);

					view = new IdentityView({ onsubmit: callback, allowSave: true, model: page });
					view.render();

					prepareAndShowHeader(view.$el);
					view.show();

				}

				Dispatcher.off("loading/stop", hideLoadingMessage).on("loading/stop", hideLoadingMessage);
			};

			Capriza.clearIdentity = function() {
				if (view) {
					view.destroy();
					view = undefined;
				}
			}
		});

		var IdentityView = Capriza.Views.PageView.extend({
			id: "identity-page",
			events:{
				"keypress form":function(e){
					if(e.keyCode==13)
					{
						$("#identity-page").find("input, select, textarea").blur();
						$("#identity-submit-btn").click();
						return false;
					}
				}
			},
			fullScreen: true,
			bounce: false,
			identityWidgets: {},

			initialize: function() {

				_.bindAll(this, "_goBack", "destroy");

				this.initIdentityWidgets();

				var self = this;
				this.listenTo(this.model, "identityPage/controlChanged", function(control) {

					self.identityWidgets[control.get('type')].update(control);

				});
			},

			initIdentityWidgets: function() {

				this.identityWidgets['image'] = Capriza.IdentityWidget.Image;
				this.identityWidgets['textbox'] = Capriza.IdentityWidget.Textbox;
				this.identityWidgets['passwordbox'] = Capriza.IdentityWidget.Password;
				this.identityWidgets['listbox'] = Capriza.IdentityWidget.Listbox;
				this.identityWidgets['content'] = Capriza.IdentityWidget.Content;
				this.identityWidgets['link'] = Capriza.IdentityWidget.Link;

				var self = this;
				_.each(this.identityWidgets, function(widget) {
					widget.initialize(self, self.model);
				});
			},

			_render: function() {

				var data = this.model;
				this.$el.addClass("identity");

				if (data.get('presentationControl')) {
					return this._renderWithPresentationControls();
				}
				else {
					return this._renderIdentity();
				}

			},

			_renderIdentity: function() {
				var _this = this;

				var templateData = {
					noPlaceholder: Capriza.device.ios6,
					icon: appData.icon_url
				};

				this.$el.append(Handlebars.templates['identity-page'](templateData));

				Capriza.device.isTablet && this.$el.addClass("tablet");

				this.createAndInsertFieldElement('identity-username0', {type:'textbox', name:'Username'});
				this.createAndInsertFieldElement('identity-password', {type:'passwordbox', name:'Password'});

				this.$username = this.$("#identity-username0").val(this.model.get('username') || "");
				this.$password = this.$("#identity-password").val(this.model.get('password') || "");


				this.$shouldSave = this.$("#identity-check");
				this.$signin = this.$("#identity-submit-btn");

				this.$signin.realButton({ name: "Sign In" });

				if (_urlParams.demo || this.model.get('canLogin')) {
					setTimeout(function () {
						_this.$username.val("demo@capriza.com");
						_this.$("#identity-password").val("********");
					}, 0);

					this.$("#identity-submit-btn").remove();
					this.$("#identity-demo-submit-btn").css("display","block");
					this.$("#identity-demo-submit-btn").realButton({ name:"Sign In with Demo Account" });
					this.$("#identity-demo-submit-btn").on("click", function (e) {

						_this.options.onsubmit && _this.options.onsubmit({ });


//                    _this.clear();
						_this.leave();
					});

					if (!window.devMode) {

						//seek attention
						setTimeout(function () {
							_this.$("#identity-demo-submit-btn").toggleClass("animated tada")
						}, 2000);
						_this.attentionSeekInterval = setInterval(function () {
							_this.$("#identity-demo-submit-btn").toggleClass("animated tada")
						}, 4000);
					}


				}


				/**
				 * NOTE: this could have been implemented by having the submit logic inside the "submit" handler (instead of the click on submit)
				 * However, if the submit handler is used, then the browser validates that the input type="email" actually has an email.
				 * So if the type isn't really email then the validation is unnecessary. Hell, even if it's email you don't want the browser to do the
				 * UI for the validation. So maybe it shouldn't be email. Anyway, not using the submit handler, but rather the click on the submit button
				 * (along with the keypress handler on the form - see above)
				 */
				this.$("form").submit(function () {
					return false;
				});

				this.$signin.on("click", function(e) {
					var username = _this.$username.val();
					var password = _this.$password.val();
					var saveCredentials = _this.$shouldSave.prop("checked");

					//force login to demo account if necessary

					if (username == "demo@capriza.com" && _this.options.data.canLogin) {
						_this.options.onsubmit && _this.options.onsubmit({ });
					} else {
						_this.options.onsubmit && _this.options.onsubmit({ username:username, password:password }, saveCredentials);
					}



					if (saveCredentials) {
						if(appData.remember_passwords){
							Capriza.LoginManager.saveCredentialsForType({ username:username, password:password }, Capriza.LoginManager.credentialsTypes.LOGIN1_KEYS, _this.model.get('host'));

						}else{
							Capriza.LoginManager.saveCredentialsForType({ username:username}, Capriza.LoginManager.credentialsTypes.LOGIN1_KEYS, _this.model.get('host'));
						}
					} else {
						Capriza.LoginManager.clearCredentialsForHost(_this.model.get('host'));
					}
//                _this.clear();
					_this.setFlash("");
					_this.leave();
				});
			},

			_renderWithPresentationControls: function() {
//            this.processControls();
				var _this = this;

				var templateData = {
					noPlaceholder: Capriza.device.ios6,
					icon: appData.icon_url
				};

				this.$el.append(Handlebars.templates['identity-page'](templateData));

				Capriza.device.isTablet && this.$el.addClass("tablet");

				this.model.get('presentationControl').controls.forEach(function(control){


					if (control.get('type') !== 'image') {
						_this.$("#identity-image").addClass('hidden')
					}

					if (control.get('type') === "passwordbox") {
						_this.passwordControl = control;
					}

					var identWidget = _this.identityWidgets[control.get('type')];

					//The reason this might be undefined, is sometimes we get a control which is hard coded in the UI and
					//the data from the presentationControl is ignored. this why we didn't even init a widget for it.
					if (identWidget) {
						identWidget.create(control);
					}
				});

				Dispatcher.once("page/change/beforeTransition", function() {
					_this.$(".field.labeled").each(function() {
						var label = $("label", this), field = $(this);
						logger.log("label=" + label[0].getBoundingClientRect().width + ", field=" + field.width());
						if (label.width() > (field.width() / 2)) {
							field.addClass("vertical");
						} else {
//                        $(".value", field).css("margin-left", label.width() + 15);
						}
					});
				});



//            this.$username = this.$("#identity-username0").val(data.username || "");
//            this.$password = this.$("#identity-password").val(data.password || "");

				this.$shouldSave = this.$("#identity-check");
				this.$signin = this.$("#identity-submit-btn");

				this.$signin.realButton({ name: "Sign In" });


				if (_urlParams.demo || this.model.get('canLogin')) {
					setTimeout(function () {
						_this.$username.val("demo@capriza.com");
						_this.$("#identity-password").val("********");
					}, 0);

					this.$("#identity-demo-submit-btn").css("display","block");
					this.$("#identity-demo-submit-btn").realButton({ name:"Sign In with Demo Account" });
					this.$("#identity-demo-submit-btn").on("click", function (e) {

						_this.options.onsubmit && _this.options.onsubmit({ });


//                    _this.clear();
						_this.setFlash("");
						_this.leave();
					});

					if (!window.devMode) {

						//seek attention
						setTimeout(function () {
							_this.$("#identity-demo-submit-btn").toggleClass("animated tada")
						}, 2000);
						_this.attentionSeekInterval = setInterval(function () {
							_this.$("#identity-demo-submit-btn").toggleClass("animated tada")
						}, 4000);
					}


				}

				this.$("form").submit(function () {
					return false
				});

				this.$signin.on("click", function(e) {
					var username = _this.getInputValue(_this.model.get('usernameMapping')[0]);
					var password = _this.getInputValue(_this.passwordControl.id);
					var saveCredentials = _this.$shouldSave.prop("checked");

					//force login to demo account if necessary

					if (username == "demo@capriza.com" && _this.model.get('canLogin')) {
						_this.options.onsubmit && _this.options.onsubmit({ });
					} else {
						_this.options.onsubmit && _this.options.onsubmit({
							username:_this.getInputValue(_this.model.get('usernameMapping')[0]),
							password:password,
							username2:_this.getInputValue(_this.model.get('usernameMapping')[1]),
							username3:_this.getInputValue(_this.model.get('usernameMapping')[2]),
							listbox: $('select', '#identity-page').prop("selectedIndex")
						}, saveCredentials);
					}



					if (saveCredentials) {
						if(appData.remember_passwords){
							Capriza.LoginManager.saveCredentialsForType({
								username:_this.getInputValue(_this.model.get('usernameMapping')[0]),
								password:password,
								username2:_this.getInputValue(_this.model.get('usernameMapping')[1]),
								username3:_this.getInputValue(_this.model.get('usernameMapping')[2]),
								listbox: $('select', '#identity-page').prop("selectedIndex")
							}, Capriza.LoginManager.credentialsTypes.LOGIN1_KEYS, _this.model.get('host'));

						}else{
							Capriza.LoginManager.saveCredentialsForType({ username:_this.getInputValue(_this.model.get('usernameMapping')[0]),
								username2:_this.getInputValue(_this.model.get('usernameMapping')[1]),
								username3:_this.getInputValue(_this.model.get('usernameMapping')[2]),
								listbox: $('select', '#identity-page').prop("selectedIndex")}, Capriza.LoginManager.credentialsTypes.LOGIN1_KEYS, _this.model.get('host'));
						}

					} else {
						Capriza.LoginManager.clearCredentialsForHost(_this.model.get('host'));
					}

					_this.setFlash("");
					_this.leave();
				});
			},

			getInputValue: function(mcId) {

				return this.$("#"+mcId).val();
			},

			createAndInsertFieldElement: function(id, inputControl) {

				var klass = /(textbox|listbox|passwordbox)/.test(inputControl.type) ? "labeled" : "", data = this.model;

				var currValue = inputControl.type === "content" ? $(inputControl.value).text() : undefined;

				if (inputControl.type === "textbox") {
					var controlId = inputControl.id;
					currValue = this.getTextValueForID(controlId);
				}

				if (inputControl.type === "listbox") {
					currValue = data.listbox
				}

				if (inputControl.type === "passwordbox") {
					currValue = data.password
				}

				var templateData = {
					klass: klass,
					id: id,
					name: inputControl.name,
					value: currValue,
					options: inputControl.type === "listbox" ? Object.keys(inputControl.items).map(function(key) {

						return {
							optionText: inputControl.items[key],
							optionValue: key,
							selected: key=== currValue && currValue.toString() ? 'selected': '' };
					}) : undefined
				};

				var fieldElement = $(Handlebars.templates["identity-" + inputControl.type](templateData));

				if (inputControl.type === "content") {
					this.$(".fields").before(fieldElement);
				}
				else if (inputControl.type === "textbox" || inputControl.type === "passwordbox" || inputControl.type === "listbox") {
					this.$(".fields").append(fieldElement);
				}
				else {
					this.$(".fields").after(fieldElement);
				}


			},

			getTextValueForID: function(controlId) {

				var controlIndex, data = this.model;

				if (!data.get('usernameMapping')) return;

				for (var i = 0; i < data.get('usernameMapping').length; i++){
					if (data.get('usernameMapping')[i] === controlId) {
						controlIndex = i;
					}
				}

				if (controlIndex === 0){
					return data.get('username');
				}
				else if (controlIndex === 1) {
					return data.get('username2');
				}
				else if (controlIndex === 2) {
					return data.get('username3');
				}
				else {
					return '';
				}


			},

			show: function() {
				var data = this.model, self = this;
				Dispatcher.trigger("identity/show", {timeFromAccessURL: data.get('timeFromAccessURL')});
				//$.capriza.hideLoadingCenter();
				appData.identityShow = true;
				if (data.get('host') && appData.xkcd) {
					var decrypted = Capriza.LoginManager.getSavedCredentialsForType(Capriza.LoginManager.credentialsTypes.LOGIN1_KEYS, data.get('host'));
					if (decrypted) {
						this.$username.val(decrypted.username);
						if(decrypted.password){
							this.$password.val(decrypted.password);
						}
						if (decrypted.username2){
							this.$("#identity-username2").val(decrypted.username2);
						}
						if (decrypted.username3){
							this.$("#identity-username3").val(decrypted.username3);
						}
						this.$shouldSave.prop("checked", true);
					}
				}


				var $shouldSave = this.$(".field.shouldSave");
				if (this.options.allowSave) {
					$shouldSave.removeClass("hidden");
					var config = window.appData && window.appData.config;
					if (!config || config && !config.dontSaveCredentialsByDefault){
						self.$shouldSave.prop('checked', true);
					}
				} else {
					$shouldSave.addClass("hidden");
				}

				if(this.options.allowSave && !appData.remember_passwords){
					$shouldSave.find("label").text("Save username on this device");
				}

				this.setTitle(appData.app_name);
				this.setHost(data.get('host'));

				if (data.get('prevInvalid')) {
					this.$el.addClass("has-error");
					this.setFlash(Capriza.translator.getText(Capriza.translator.ids.incorrect));
					Capriza.LoginManager.credentialsSavedForHosts[data.get('host')] = false;
				}

				$('#splash-message').empty();
				$('.field').removeClass('disabled');

				$.capriza.changePage(this.$el, { transition: "slideup", prevPageNoTransition: true });

				if(Capriza.device.android2){
					Capriza.reflow();
				}
			},

			leave: function() {

				clearInterval(this.attentionSeekInterval);

				Capriza.splashRenderAuthMessage(Capriza.translator.getText(Capriza.translator.ids.loading));

				$('.field').addClass('disabled');

				var _this = this;

				Dispatcher.on("mobile/active login/show confirmation/show mobile/error", this._goBack);

				Dispatcher.on("page/beforeChange", this.destroy);
			},

			_goBack: function(){
				$.capriza.backPage({ transition: "slideup", prevPageNoTransition: true });
				this.clear();
				$('.field').removeClass('disabled');
				$('#splash-message').empty().removeClass('active');
				Utils.hideUnimessages();
			},

			setTitle: function(title) {
				this.$("header h1").text(title || "");
			},

			setHost: function(host) {
				this.$(".identity-host").text(host || "");
			},

			setFlash: function(text) {
				this.$(".identity-flash").text(text || "");
			},

			clear: function() {
				this.$('.value input').val("");
				this.$shouldSave.prop("checked", false).removeClass("hidden");
				this.setTitle("");
				this.setFlash("");
			},

			destroy: function(){
				Capriza.Views.PageView.prototype.destroy.call(this);
				Dispatcher.off("mobile/active login/show confirmation/show mobile/error", this._goBack);
				Dispatcher.off("page/beforeChange", this.destroy);
				view = undefined;
			}
		});

		var view;
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/CompatMode.js

try{
	;(function() {

		if (!Capriza.compatMode) return;
//    function block(e) {
//        if (e.target !== Capriza.OneMomentPlease.$el[0] && !$.contains(Capriza.OneMomentPlease.$el[0], e.target)) {
//            Capriza.OneMomentPlease.show();
//        }
//        e.preventDefault();
//        e.stopPropagation();
//    }
//
//    Capriza.OneMomentPlease.blockUI = function() {
//        $(".viewport")[0].addEventListener("touchstart", block, true);
//    };
//
//    Capriza.OneMomentPlease.unblockUI = function() {
//        $(".viewport")[0].removeEventListener("touchstart", block, true);
//    };


		function setMinHeight() {
//        $(".viewport, .cover-page").css("min-height", window.innerHeight);
			$("body").css({height:"auto"});
			$("html").css({height:"auto"});
		}

		Dispatcher.on("app/init", function() {
			$(".viewport").addClass("compat-mode");
			setMinHeight();
			$.capriza.usePageAnimation = false;
//        $.capriza.currentScrollPosition = function() {
//            return window.pageYOffset;
//        };


			/*
        Save and restore scrolling positions
         */
			/* Dispatcher.on("page/beforeChange page/back/before", function(data) {

            // at this point, the "from-page" is visible, and this is the last point in time we can take the scroll position for it.
            // the "to-page" is not visible yet, so we have to wait for "page/change/beforeTransition" until we can scorll to the target position.

            var activePageView = $.capriza.activePage.data("pageView");
            if (!activePageView) return;

            activePageView.scrollPosition = $.capriza.currentScrollPosition();

            Dispatcher.once("page/change/beforeTransition", function() {
                var pageView = data.toPage.data("pageView");
                var scrollPosition = pageView.scrollPosition;
                if (scrollPosition) {
                    pageView.scrollTo(0, scrollPosition);
                } else {
                    pageView.scrollTo(0,0);
                }
            });

        });
*/
			/*   Capriza.Views.PageView.prototype.scrollTo = function(x, y) {
            window.scrollTo(x, y);
        };*/


//        $(window).on("orientationchange resize", function (e) {
//            setMinHeight();
//            setTimeout(function() {
//                setMinHeight();
//            }, 100);
//        });
//
//        Dispatcher.on("login/show", function() {
//            setTimeout(setMinHeight, 0);
//        });
		});
	})();
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/AppInstall.js

try{
	(function () {
		Dispatcher.on('app/init', function () {
			if (!(Capriza.device.ios && (window.appData && appData.config && appData.config.addToHome))) return;

			var add2homeKey = appData.app_token + "add2homeClosed";
			Dispatcher.on("mobile/active identity/show", function () {
				setTimeout(function () {

					if (ClientCache.getItem(appData.app_token + "add2homeClosed")) {
						return;
					}
					addToHome.show();
				}, 10000);
			});
			$(document).on("touchstart", "#addToHomeScreen", function () {
				addToHome.close();
				ClientCache.setItem(add2homeKey, true);
			});
			$(document).on("click", ".addToHomeClose", function () {
				ClientCache.setItem(add2homeKey, true);
			});
		});
	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/Instrumentation.js

try{
	;(function() {

		if (window.isDesignerPreview) return;

		var appId;
		var Event = function(category, action, label, props) {

			var identity = JSON.parse(localStorage.getItem('unique_token'));
			var identityValue = identity ? identity.value : '';

			props=props || {};


			props.urlParams=_urlParams;
			props.appId = props.appId || appId;


			return {
				type    : 'events',
				source  : 'htmlClient',
				category : category,
				action: action,
				label: label,
				identity: identityValue,
				sessionId: ComManager.sessionId(),
				props: props
			};
		};

		var LaunchEvent = function(app) {
			var source = ((Capriza.isPhonegap || Capriza.cordova) ? "native" : (Capriza.device.isMobile ? "mobile-html" : "web-html"));

			var props = {
				appId: app.app_id,
				appName: app.app_name,
				source: source,
				userAgent: navigator.userAgent,
				platform: navigator.platform,
				language: navigator.language,
				connectionType: navigator.connection && navigator.connection.type
			};

			if (navigator.standalone) {
				props.standalone = navigator.standalone;
			}

			var identity = JSON.parse(localStorage.getItem('unique_token'));
			Capriza.runId = (identity ? String(identity.value).slice(0,3) : "aaa") + ":" + Date.now();

			return Event('runs', 'run', Capriza.runId, props);
		};

		var PerfEvent = function(options) {
			Logger.debug('PerfEvent Started');
			var props = {
				measures: take.toJSON(),
				transport: ComManager.transport
			};

			$.extend(props, options);

			return Event('performance', 'sample', Capriza.runId, props);
		};

		var TraceEvent = function(data) {
			return Event('instrumentation', 'events', Capriza.runId, data);
		};

		function sendStats(events, sync) {
			var data = _.isArray(events) ? events : [events];

			var stats = {
				version : '1.1',
				data: data
			};

			var statsStr = JSON.stringify(stats);

//        console.log('sending '+statsStr+' to '+Config.napiUrl+'/api/stats/events');
			if (window.devMode) return;

			$.ajax({
				type: 'POST',
				url: Config.napiUrl+"/stats/events",
				data: statsStr,
				contentType: 'application/json',
				dataType: 'json',
				async: !sync
			});
		}

//    Capriza.runId = (identity ? identity.slice(0,3) : "aaa") + ":" + Date.now();

		/****************************************/
		/*** Chapter 1: "I have run this app" ***/
		/****************************************/

		Dispatcher.on("runner/run", function(app) {
			appId = app.app_id;
			sendStats(LaunchEvent(app));
		});



		/************************************************************************/
		/*** Chapter 2: "This is the time that it took for this app to start" ***/
		/************************************************************************/

// Take two minute to send performance stats on app launch.
		var timeoutDelay = 120000;
		var launchTimeout = setTimeout(function() {
			launchTimeout = undefined;
			take("timeout");
			sendStats(PerfEvent({startReason: "timeout"}));
		}, timeoutDelay);

		Dispatcher.on('application/firstContext identity/show', function(data){
			if (!window.Capriza.firstMobilePageTime){
				window.Capriza.firstMobilePageTime = Date.now();
				take("firstMobilePage");
			}
			take('firstVisiblePage');
			var firstVisiblePageTime = take.firstVisiblePage-take.start;
			var appCache = window.applicationCache;

			Logger.debug('first visible page, engineFirstVisiblePage = ' + data.timeFromAccessURL+
				', firstRun: '+!!Capriza.firstRun+
				', firstVisiblePage: '+firstVisiblePageTime+
				', appCacheStatus: '+appCache.status);

			Capriza.appStarted = true;
			clearTimeout(launchTimeout);
			launchTimeout = undefined;
			sendStats(PerfEvent({startReason: take.startReason, engineFirstVisiblePage: data.timeFromAccessURL, firstRun: Capriza.firstRun, appCacheStatus: appCache.status}));

			if (shouldShowTime()) {
				setTimeout(showTimeMsg, 4000);
			}

		});

		window.addEventListener("unload", function() {
			if (launchTimeout && !Capriza.appStarted) {
				take("unload");
				sendStats(PerfEvent({startReason: "unload"}), true);
			}
		});

		/************************************************************************/
		/*** Chapter 3: "" ***/
		/************************************************************************/


		var events = [
			"social/cmenu/clicked"
			,"social/facebook/clicked"
			,"social/twitter/clicked"
			,"extension/loaded"
		];

		var eventHappenings = [];

		_.each(events, function(event) {
			Dispatcher.on(event, function(data) {
				eventHappenings.push({ type: event, data: data });
			});
		});

		setInterval(function() {
			if (eventHappenings.length > 0) {
				sendStats(eventHappenings.map(function(event) {
					return TraceEvent(event);
				}));
				eventHappenings = [];
			}
		}, 60000);


		function shouldShowTime() {
			return !isTimeMsgDisabled() && isMsgEnv();
		}

		function isTimeMsgDisabled() {
			return window.appData && window.appData.config ? window.appData.config.disableTimeMsg : false;
		}

		function isMsgEnv() {
			//return window.location.host.indexOf("zappdev") > -1;
			return false;
		}

		function showTimeMsg() {
			if ($('.mvp.active').length > 0) return;
			var timeToFirstPage = parseFloat((take.firstPage - take.start) / 1000).toFixed(2);
			Logger.debug('showing time message');
			Dispatcher.trigger('message/showCustom', {message: "First page took " + timeToFirstPage + "s to load", shouldShowLoadingIndicator: false});
			setTimeout(function () {
				Dispatcher.trigger('dialog/hide')
			}, 4000);
		}


	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/SideMenu.js

try{
	/**
	 * Created by maayankeenan on 2/16/15.
	 */
	(function() {
		var eventTrigger = "click";//Capriza.device.isMobile ? "touchend" : "click";
		var constAnimTimeDiff = 200;
		var menu;
		var isInitialized;
		Dispatcher.on("app/init", function() {

			//if (!window.appData && !window.isDesignerPreview) {
			//    Logger.debug('Side menu requires api connection');
			//    return;
			//}

			Dispatcher.on('sideburger/hide', function() {
				$('.viewport').addClass('no-settings');
			});

			var noMenuByFlag = window.appData && window.appData.config && window.appData.config.destroyGears;

			if(noMenuByFlag) {
				$('.viewport').addClass('no-settings');
				return;
			}
		});

		Dispatcher.on("sideburger/show", function($header) {
			var $sideburger = $("#side-burger",".page.active, .page.disabled");
			if($header.find('#side-burger').length == 0){
				$sideburger = $('<div id="side-burger" class="side-burger" role="button" aria-label="Open Side Menu"><i class="icon-sideburger"></i></div>');
				$header.prepend($sideburger);
			}

			var $headerOverlay = $("#header-overlay");
			if ($headerOverlay.length && !$headerOverlay.hasClass(".side-menu")){
				$("#side-menu").removeClass("active open transitioning").addClass("close");
			}

			var menu = $('#side-menu').data('pageView');

			function beforeToggle() {
				$sideburger = $("#side-burger",".page.active, .page.disabled");
				menu.toggleMenu("click");
			}

			if (menu && $sideburger.length) {
				$sideburger[0].addEventListener('click', beforeToggle);
			}
		});

		Capriza.Views.SideMenu = Backbone.View.extend({
			tagName: "div",
			id: 'side-menu',

			initialize : function() {
				var self = this;
				_.bindAll(this, "toggleMenu", "overlayToggleEnd");

				this.$viewportOverlay = $('<div id="viewport-overlay"></div>').appendTo($('.viewport'));

				this.isSignoutActive = false;

				Dispatcher.on("identity/addSignOut", function () {
					self.isSignoutActive = true;
					self.configureMenu();
				});

				Dispatcher.on("identity/removeSignOut", function () {
					self.isSignoutActive = false;
					self.configureMenu();
				});

				Dispatcher.on('page/change/beforeTransition', function() {
					if (self.$el.hasClass('open')) {
						self.toggleMenu("page-change");
					}
				});

				Dispatcher.on("appName/change", function() {
					self.$("#settings-title>.inner-text").text(Utils.getAppName());
				});

				Dispatcher.on("app/online", this.connectionStatusChanged, this);
				Dispatcher.on("app/offline", this.connectionStatusChanged, this);

				this.blockDisplay  = function(e) {
					e.preventDefault();
					e.stopPropagation();
					self.toggleMenu("block-display");
				};
			},

			render : function() {
				var html =
					    Handlebars.templates.sidemenu({appName: Utils.getAppName()});

				this.$el = $(html);
				$('.viewport').append(this.$el);
				this.initSettingsMenu();
				this.initButtonsLogic();
				this.configureMenu();
				this.initDrag();
				this.heroMode();
			},

			refreshSignOut: function(){
				var html =
					    Handlebars.templates.sidemenu({appName: Utils.getAppName()}),
				    zappSignOut = this.$el.find("#settings-sign-out"),
				    templateSignOut = $(html).find("#settings-sign-out");
				if (!zappSignOut.length || !templateSignOut.length) return;
				zappSignOut.text(templateSignOut.text());
			},

			initSettingsMenu : function() {
				if (!Capriza.device.firefox) {
					var $v = this.$(".settings-item-icon[data-icon]");
					$v.each(function(item){
						$(this).attr({role:"button",'aria-label': this.nextElementSibling.innerText});
					});
					$v.on("touchstart touchend", function () {
						$(this).toggleClass(
							this.dataset.icon + " " + this.dataset.iconActive);
					});
				}

				if(!Capriza.isStore) {
					this.$('.settings-profile').css('display', 'none');
				} else {
					this.setPersonalInfo();
				}
			},

			setPersonalInfo: function(){
				var _this = this;
				window.Capriza.avatarAPI.getUserImage(function(src){
					if (!src) return;

					_this.$('.avatar-container').css({"display":"block"})[0].src = src;
					_this.$('.profile-pic i').hide();
				});

				_this.$('.settings-profile .settings-item-title').text(ClientCache.getItem("userEmail"));
			},

			initButtonsLogic  : function() {
				//var constAnimationFinished = constAnimTimeDiff * 2,
				var sendFeedback = $("#settings-send-feedback"),
				    feedbackPage = undefined;

				sendFeedback.on(eventTrigger, function(e){
					feedbackPage = feedbackPage || new Capriza.Views.SideMenu.FeedbackPage();
					try{
						Utils.reportInteraction({
							element: "Feedback (Side Menu)",
							interaction: "Send Feedback",
							controlPath: "#settings-send-feedback>div"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Side menu send feedback interaction");
					}
					e.preventDefault();
					feedbackPage.$el.addClass('transitioning');
					executeFunc(function(){
						feedbackPage.render();
						feedbackPage.$el.removeClass('transitioning');
						self.toggleMenu("feedback");
					});
				});

				var closeApp = $("#settings-close-zapp");
				$.capriza.fastClick(closeApp[0]);
				var self = this;
				closeApp.on(eventTrigger, function(){
					try{
						Utils.reportInteraction({
							element: "Close Zapp (Side Menu)",
							interaction: "Close Zapp",
							controlPath: "#settings-close-zapp>div"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Side menu Close app interaction");
					}

					self.toggleMenu();

					// First close the side menu, than exist the zapp. we don't wait for the side menu animation to end because closing the zapp taking longer than the animation
					// (if this is not the case in the future just listen to Dispatcher.on('sidemenu/animationended')
					Dispatcher.trigger('app/close');

				});

				var signOut = $("#settings-sign-out");
				signOut.on(eventTrigger, function(){
					try{
						Utils.reportInteraction({
							element: "Sign Out (Side Menu)",
							interaction: "click",
							controlPath: "#settings-sign-out>div"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Side menu signout interaction");
					}
					executeFunc(function() {
						Dispatcher.trigger("identity/host/logout");
						self.toggleMenu("signout");
					});
				});

				var settingsPage = new Capriza.Views.SettingsPage();

				var zappSettings = $("#settings-zapp-settings");
				zappSettings.on(eventTrigger, function () {
					try{
						Utils.reportInteraction({
							element: "Settings (Side Menu)",
							interaction: "Open Settings",
							controlPath: "#settings-zapp-settings>div"
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Side menu settings interaction");
					}
					settingsPage.$el.addClass('transitioning');
					executeFunc(function () {
						settingsPage.render();
						settingsPage.$el.removeClass('transitioning');
						self.toggleMenu("settings");
					});
				});

				function executeFunc(func){
					if (!self.$el.hasClass('transitioning')){
						window.setTimeout(function(){
							func();
						}, 1);
					}
				}

				// $('.settings-item', this.$el).on(eventTrigger, this.toggleMenu);
			},
			overlayToggleEnd: function(e){
				clearTimeout(this.clearTransitionTimeout);
				Dispatcher.trigger("sidemenu/transitionEnd");
				this.$el.removeClass("sidemenu-transitioning");
				this.$el[0].style["transition-duration"] = "";
				this.$el[0].style["transition-timing-function"] = "";
				$("#viewport-overlay").removeClass("transitioning");
				$('.side-burger').removeClass('clicked');
				Dispatcher.trigger('sidemenu/animationended');
			},

			toggleMenu : function(method) {
				var container = $('.viewport .page.active .header');
				if (container.hasClass('no-settings')) return;

				//bad code - no choice for now...
				$('#start-page').remove();
				if (container.hasClass('no-settings')) return;
				method = method || "click";
				Logger.debug("[SideMenu] Toggling side menu using "+ method);
				var shouldOpenSideMenu = !this.$el.hasClass("sidemenu-opened");
				this.$el.off(Utils.transitionEnd, this.overlayToggleEnd).on(Utils.transitionEnd, this.overlayToggleEnd);
				this.$el.addClass("sidemenu-transitioning");
				//this.$viewportOverlay.addClass("transitioning");
				this.clearTransitionTimeout = setTimeout(self.overlayToggleEnd, 400);
				if (shouldOpenSideMenu){
					try{
						Utils.reportInteraction({
							element: "SideMenu",
							interaction: "click",
							controlPath: "#side-burger .icon-sideburger",
							additionalData: "open side menu using "+method
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Open side menu interaction");
					}
					this.$el.removeClass("close");
					this.$el.addClass("active sidemenu-opened");
					this.$viewportOverlay.on(eventTrigger, this.blockDisplay);
					Utils.viewportOverlayForElement("side-menu");
				} else {
					try{
						Utils.reportInteraction({
							element: "SideMenu",
							interaction: "click",
							controlPath: "#viewport-overlay.active.side-menu",
							additionalData: "closing side menu using "+method
						});
					} catch(e){
						Logger.info("[UserInteraction] Exception on report Closing side menu interaction");
					}
					this.$el.removeClass("active sidemenu-opened");
					this.$el.addClass("close");
					this.$viewportOverlay.off(eventTrigger, this.blockDisplay);
					Utils.removeViewportOverlayForElement("side-menu");
				}
				this.$el[0].style.transform = "";
				document.getElementById("viewport-overlay").style["background-color"] = "";
			},

			configureMenu : function() {
				var closeZapp = $("#settings-close-zapp", this.$el),
				    signOut = $("#settings-sign-out", this.$el),
				    sendFeedback = $("#settings-send-feedback", this.$el),
				    noFeedbackByFlag = window.appData && window.appData.config && window.appData.config.destroyFeedback;

				if (noFeedbackByFlag) {
					sendFeedback.addClass('inactive');
				}

				if (Capriza.isStore){
					closeZapp.removeClass('inactive');
				} else {
					closeZapp.addClass('inactive');
				}

				if(window.isDesignerPreview){
					closeZapp.attr('disabled', true);
					sendFeedback.attr('disabled', true);
				}

				if (this.isSignoutActive) {
					this.refreshSignOut();
					signOut.removeClass('inactive');
				} else {
					signOut.addClass('inactive');
				}
				this.connectionStatusChanged();

				var container = $('.viewport .page.active .header').addClass('no-settings');
				var areThereActiveItems = $('.settings-item:not(.inactive, .settings-profile)').length > 0;

				areThereActiveItems ? container.removeClass('no-settings') : container.addClass('no-settings');
			},

			// Enables/disables network-dependant items in SideBar
			connectionStatusChanged: function () {
				var isOnline = Capriza.Connection ? Capriza.Connection.isOnline
					: Utils.isNavigatorOnline();

				isOnline ? this.$(".network-dependant").removeAttr("disabled")
					: this.$(".network-dependant").attr("disabled", true);

				if (window.isDesignerPreview) {
					$("#settings-send-feedback").attr("disabled", true);
				}
			},

			prepareForDrag : function(step){
				Logger.debug("side menu - prepare for drag");
				if (this.$el.hasClass("sidemenu-transitioning") || !step || !step.pageX) return;
				if ((!this.$el.hasClass("sidemenu-opened") && step.pageX < 40 && step.direction == "right") ||
					(this.$el.hasClass("sidemenu-opened") && step.pageX < (this.$el.width()+50) && step.direction == "left")){
					//just in case the user is focus on an input field need to blur in order to dissmiss the keyboard
					document.activeElement.blur();
					Logger.debug("side menu - set dragging");
					this.$el.addClass("dragging");
				}
			},
			cancelDrag: function(curItemX, element, step, transformProperty){
				Logger.debug("side menu - cancel dragging");


				this.$el.removeClass("dragging");
				this.clearTransitionTimeout = setTimeout(this.overlayToggleEnd, 400);
				this.$el.off(Utils.transitionEnd, this.overlayToggleEnd).on(Utils.transitionEnd, this.overlayToggleEnd);
				//this.$el[0].style["transition-timing-function"] = "cubic-bezier(0,0,0.1,1.2)";

				this.$el.addClass("sidemenu-transitioning");
				//this.$viewportOverlay.addClass("transitioning");
				this.$el.removeClass("dragging");
				this.$el[0].style[transformProperty] = "";
				//this.$viewportOverlay[0].style["background-color"] = "";
			},
			draggingMethod: function(step,transformProperty){
				if (this.$el.hasClass("dragging")){
					var elWidth = this.$el.width();
					if (elWidth < step.pageX){
						step.pageX = elWidth;
					}
					this.$el[0].style[transformProperty] = "translate3d("+step.pageX+"px,0,0)";
					// 0.36 is the final opacity for the viewport-overlay from _header.scss
					//if (!Capriza.device.android) {
					//    var opacity = (step.pageX / elWidth);
					//    this.$viewportOverlay[0].style["background-color"] = "rgba(0,0,0," + (opacity * 0.36) + ")";
					//}
				}
			},
			swipingRight: function(element, velocity, distance){
				if (this.$el.hasClass("sidemenu-opened")){
					this.swipingMethod(element, velocity, distance);
				} else {
					this.cancelDrag(null, null, null, $.capriza.transformProperty);
				}
			},
			swipingLeft: function(element, velocity, distance){
				if (!this.$el.hasClass("sidemenu-opened")){
					this.swipingMethod(element, velocity, distance);
				} else {
					this.cancelDrag(null, null, null, $.capriza.transformProperty);
				}
			},
			swipingMethod: function(element, velocity, distance){
				if (this.$el.hasClass("dragging")){
					this.$el.removeClass("dragging");
					//var duration = 450 / (this.$el.width() / (this.$el.width() - distance)); // remaining distance
					//if ( velocity > 0.1) {
					//    duration *= ((1-velocity) + 0.4);
					//}
					//this.$el[0].style["transition-duration"] = duration + "ms" ;
					//this.$el[0].style["transition-timing-function"] = "cubic-bezier(0,0,0.1,1.1)";
					this.toggleMenu("swipe");
				}
			},
			disableDrag : function(){
				return this.$el.hasClass("sidemenu-transitioning");
			},

			initDrag : function() {
				var self = this;
				var shouldCompleteAction = function(velocity, curXAbs){
					var threshold = 0.4;
					Logger.log("should complete action - velocity: "+ velocity+", curxAbs: " +curXAbs);
					return (velocity > 0.3 || curXAbs >= self.$el.width()*threshold);
				};

				var dragOptions = {
					swipeRight : this.swipingRight.bind(this),
					swipeLeft : this.swipingLeft.bind(this),
					shouldCompelteAction: shouldCompleteAction.bind(this),
					dragCallback: this.draggingMethod.bind(this),
					onCancel: this.cancelDrag.bind(this),
					onStart: this.prepareForDrag.bind(this),
					isSwipeDisable: this.disableDrag.bind(this)
				};

				$(".viewport").drag(dragOptions);
			},

			initSwipe : function() {
				var self = this;
				console.log('side menu initSwipe started');
				var canGoLeft, canGoRight, noDrag;
				var swipeLeft  = function() {
					if(noDrag || !canGoRight) return;
					self.toggleMenu("swipe");
				};

				var swipeRight  = function() {
					if(noDrag || !canGoLeft) return;
					self.toggleMenu("swipe");
				};

				var onStart = function() {
					if ($('.page.active').length) {
						canGoRight = self.$el.hasClass('close') && $('.page.active').position().left < self.$el.width();
						canGoLeft = self.$el.hasClass('open') && $('.page.active').position().left > 0;
						noDrag = $('.page.active').hasClass('swiping') || self.$el.hasClass('transitioning');
					}

				};

				var swipeOptions = {swipeRight: swipeRight, swipeLeft: swipeLeft,
					onStart: onStart};

				$(".context-page.active").swipe(swipeOptions);

				Dispatcher.on('page/change/after', function (options) {
					$(options.toPage, '.page.active').swipe(swipeOptions);
				});
			},
			heroModeOn: function(){
				try{
					Utils.reportInteraction({
						element: "Hero Mode (Side Menu)",
						interaction: "On",
						controlPath: "#hero-mode"
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report Side menu hero mode on interaction");
				}
				Logger.info("[Side-Menu] Hero Mode is on");
				this.$el.addClass("hero-on");
				Capriza.heroMode.on = true;
				Dispatcher.trigger("heroMode/on");
			},
			heroModeOff: function(){
				try{
					Utils.reportInteraction({
						element: "Hero Mode (Side Menu)",
						interaction: "Off",
						controlPath: "#hero-mode"
					});
				} catch(e){
					Logger.info("[UserInteraction] Exception on report Side menu hero mode off interaction");
				}
				Logger.info("[Side-Menu] Hero Mode is off");
				Capriza.heroMode.counter = 0;
				Capriza.heroMode.on = false;
				this.$el.removeClass("hero-on");
				Dispatcher.trigger("heroMode/off");
			},
			heroMode: function(){
				Logger.debug("[Side-Menu] Preprare Hero Mode");
				Capriza.heroMode = {};
				Capriza.heroMode.counter = 0;
				if (Capriza.zappInfo && Capriza.zappInfo.med_version){
					$("#med-ver", "#zapp-details").text(Capriza.zappInfo.med_version);
					$("#zapp-ver", "#zapp-details").text(Capriza.zappInfo.u_app_version);
				}
				var self = this;
				var eventToListen = Capriza.device.isMobile ? "touchstart" : "click";
				this.$el.on(eventToListen, function(e){
					var page = (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) || e;
					if (page && page.pageX < 75 && page.pageY < 75){
						if (++Capriza.heroMode.counter == 3 ){
							self.heroModeOn();
						} if (Capriza.heroMode.counter == 6){
							self.heroModeOff();
						}
					}
				});
				$.capriza.fastClick($("#settings-reload-zapp").on(eventTrigger, function(){
					Logger.info("[Side-Menu] Reload from side menu reload (Hero Mode)");
					Utils.reload();
				})[0]);

			}

		});

		Capriza.Views.SideMenu.init = function() {
			if(!isInitialized) {
				var menu = new Capriza.Views.SideMenu();
				menu.render();
				menu.$el.data('pageView', menu);
				isInitialized = true;

				$("#side-burger",".page.active, .page.disabled").on('click', menu.toggleMenu);
			}
		};


		(function(){
			function closeZapp(data){
				$.capriza.showLoadingMsg(true);
				Dispatcher.trigger("app/beforeClose");
				var param = {fromZapp:true};
				if (data && typeof data === "object") {
					$.extend(param, data);
				}
				setTimeout(function(){location.assign(_urlParams.storeUrl+"#?"+ $.param(param))}, 20);
			}

			Dispatcher.on("app/close", function(data){
				if ($('#passcode-page').hasClass('active')) {
					Dispatcher.on("passcode/hide", function(){
						closeZapp(data);
					});
				} else {
					closeZapp(data);
				}
			});
		}());

		Capriza.Views.SideMenu.FeedbackPage = Backbone.View.extend({
			id: "feedback-page",
			tagName: "div",
			className: "page ignores-header",

			initialize: function () {
				_.bindAll(this, "back", "done", '_leave');
				var options = {
					talkToUs: Capriza.translator.getText(Capriza.translator.ids.talkToUs),
					includeInfo: Capriza.translator.getText(Capriza.translator.ids.includeInfo),
					helpUsScreenshot: Capriza.translator.getText(Capriza.translator.ids.helpUsScreenshot),
					describeIssue: Capriza.translator.getText(Capriza.translator.ids.describeIssue)
				};
				this.$el.append(Handlebars.templates["send-feedback"](options)).appendTo(".viewport");
				var navLeft = $("#cancel-feedback", this.$el),
				    navRight = $("#send-feedback", this.$el);

				navLeft.on('click', this.back);
				navRight.on('click', this.done);
				Dispatcher.on('feedback/close', this._leave);
			},

			render: function () {
				var _this = this;
				_this.$el.addClass("slideup in active");
				_this.$el.one("animationend webkitAnimationEnd", function () {
					_this.$el.removeClass("slideup in");
					$(".nonmobile-wrap").removeClass("transitioning");
					if (Capriza.heroMode && Capriza.heroMode.on){
						_this.$("textarea").val("#rnd #hero ")
					} else if (_this.$("textarea").val() == "#rnd #hero "){
						_this.$("textarea").val("");
					}
					if (!Capriza.device.isMobile) {
						_this.$("textarea").focus();
					}
					Dispatcher.trigger('sidemenu/feedback/open');
				});
				$(".nonmobile-wrap").addClass("transitioning");

				if (Capriza.device.stock){
					var textarea = $('textarea', this.$el);
					textarea.height(this.$el.height() - textarea.position().top - 88);
				}
			},

			back: function () {
				this._leave();
			},

			done: function () {

				var textArea = this.$("textarea");
				var message = textArea.val();
				this.$el.find('textarea').val('');

				this._leave();

				setTimeout(function () {
					var feedbackOptions = {collectLogs: $('#feedback-allow-logs').prop('checked')};
					Utils.showUnimessage({type: "progress", messageText: Capriza.translator.getText("sendingFeedback")}, false, true, false, 4500);

					Capriza.Feedback.send(message, feedbackOptions)
						.fail(_.bind(Utils.updateUnimessage, this, {type: "error", messageText: Capriza.translator.getText("feedbackProblem")}, null, true, true, 3500))//feedbackProblem -  "Problem sending feedback, please try again."
						.done(_.bind(Utils.updateUnimessage, this, {type: "", messageText: Capriza.translator.getText("feedbackSent")}, null, true, true, 3500)); //feedbackSent replace "Feedback received, thanks."
				}, 500);
			},

			_leave: function () {
				var _this = this;
				_this.$el.addClass("slideup reverse out");
				_this.$el.one("animationend webkitAnimationEnd", function () {
					_this.$el.removeClass("slideup reverse out active");
					$(".nonmobile-wrap").removeClass("transitioning");
					Dispatcher.trigger('sidemenu/feedback/close');
				});
				$(".nonmobile-wrap").addClass("transitioning");
			}
		});
	}());

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/EntryPoint.js

try{
	;
	(function () {

		window.Dispatcher.on("app/loaded", function () {

			Logger.debug('entry point starts with ua '+navigator.userAgent+' location '+window.location);
			if (navigator.connection && navigator.connection.type) {
				Logger.debug('Connection type is '+navigator.connection.type);
			}
			Capriza.start = function () {
//            console.log('Capriza starts');
				if (!window.appData) {
//                console.log('app data is null');
					return;
				}

				if (!window.appData.error_codes) {
					logger.log('run normally');
					Runner.run({ authenticate: false });
				} else {
					if (window.appData.error_codes[0] == errorCodes.RUNTIME_NO_USER.id) {
						logger.log('need to first authenticate');
						Runner.run({ authenticate: true });
					}

					else {
						var errorCode = window.appData.error_codes[0];
						var errorObj = window.errorCodes.getErrorObjForId(errorCode);

						if (errorObj && errorObj.message) {
							Dispatcher.trigger("mobile/error", errorObj.message);
						}
						else {
							Dispatcher.trigger("mobile/error",window.appData)
						}
					}
				}
			};


			$.capriza.viewportHeight = function () {
				return Capriza.fullScreen ? window.innerHeight : $(".viewport").height();
			};


			if (Capriza.device.stock) $(".viewport").addClass("stock");

			//Capriza.loadingCenter = $("<div>").loadingCenter();
			Dispatcher.trigger("app/init");

			// initialize first page

			if ($('.context-page.active').length === 0 && $('#start-page').length === 0) {
				$.capriza.activePage = $([]);
				var startPage = new Capriza.Views.PageView({ id: "start-page" }).render();
				startPage.show({ transition: "none" });
			}



			if (Utils.caprizaMode === "ShellMode") {
				$("<div>").loadingShellMode();
			} else {
				//$("<div>").loadingHeader();
			}


			$(document).on("beforepagechange", function () {
				$.capriza.hideLoadingMsg();
			});

			var self;

			$(document)
				.on("mousedown touchstart", ".clickable", function() {
					self = this;
					$(".scrolling-area").one("scroll.onclickablescroll", function() {
						self.classList.add("clicked-canceled");
					});
					this.classList.add("clicked");
				})
				.on("mousemove touchmove", ".clickable", function(e) {
					this.classList.remove("clicked");
				})
				.on("mouseup touchend touchcancel", ".clickable", function() {
					$(".scrolling-area").off(".onclickablescrol");
					this.classList.remove("clicked");
					this.classList.remove("clicked-canceled");
				});


			//android keyboard focus fix
			if (!Capriza.device.ios) {
				$(document).on("change", "select", function (e) {
					$(e.currentTarget).blur();
				});

				$(document).on("keypress", "input", function (e) {
					if (e.keyCode == 13) {
						$(e.currentTarget).blur();
					}
				});
			}

//        console.log('about to capriza start');

			Capriza.start();


		});



		window.Dispatcher.on("identity/capriza/logout", function () {
			$.getJSON(Config.apiUrl + "/catalog/auth/logout.json")
				.error(function (msg) {
					Logger.error("error while logging out: " + msg);

				}).complete(function () {
				Utils.reload();
			});
		});




	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/new/Handlers.js

try{
	;(function () {
		Capriza.EngineApi.Handlers = {
			newPage: function (response) {

				Logger.debug('handlers newPage started');

				var transition = Capriza.Model.firstContext ? undefined : "none";

				Dispatcher.trigger('header/errors/remove');
				Dispatcher.trigger('login/after', response.page);

				var page = response.page.login ? new Capriza.Model.LoginPage(response.page) : response.cached ? new Capriza.Model.MVPage(response.page) : new Capriza.Model.ContextPage(response.page);
				if (response.page.login && Capriza.LoginManager.tryToPerformAutoLogin(page, transition)) return;

				var currPageView = $.capriza.activePage && $.capriza.activePage.data("pageView") && $.capriza.activePage.data("pageView");
				var currPageModel = currPageView && currPageView.model;
				Logger.debug('[Handlers newPage] page model compare started');
				var isSamePage = currPageModel && Capriza.Model.ContextPage.compare(page, currPageModel);
				Logger.debug('[Handlers newPage] page model compare ended');

				page.mvp = response.cached;
				page.mvppp = response.mvppp;
				var pageView = response.page.login ? new Capriza.Views.LoginPage({model: page}) :
					page.mvp ? new Capriza.Views.MVPageView({model: page}) :
						response.page.cnf ? new Capriza.Views.CNFPageView({model: page}) :
							new Capriza.Views.ContextPage({model: page});

				Logger.debug('[Handlers newPage] pageView created');
				if (isSamePage) {
					if(currPageView.state) {pageView.state = currPageView.state;}
				}

				Logger.debug('[Handlers newPage] going to render pageView');
				pageView = pageView.render();

				var uniqueId = page.get("uniqueId"), uiState = Capriza.Views.uiState, pageUiState = uiState["page" + uniqueId];
				take("pageInfo", {
						type: "pageInfo",
						uniqueId: uniqueId,
						mvp: page.mvp,
						login: response.page.login,
						cnf: response.page.cnf,
						duration: Capriza.EngineApi.Handlers.calcPageDuration(),
						name: response.page.name,
						source: 'pageInfo'
					}
				);

				var tabController;

				if (pageUiState) {
					Logger.debug("[newPage] uiState for page uniqueId=" + uniqueId + ": " + JSON.stringify(_.omit(pageUiState, "page")));
				} else {
					Logger.debug("[newPage] no uiState for page uniqueId=" + uniqueId);
				}

				if (page.get("keepUiState") && pageUiState) {
					if (pageUiState.drillId) {
						if (page.containsControl(pageUiState.tableId)) {
							Logger.debug("[newPage] keeping UI state for drill page");
							pageView.show({transition: "none"});
							pageView.getView(pageUiState.tableId).keepInDrill(pageUiState.drillId, pageUiState.drillIndex);
							delete pageUiState.drillId;
							delete pageUiState.tableId;
							return;

						} else {
							Logger.debug("[newPage] NOT keeping UI state for drill page");
							delete pageUiState.drillId;
							delete pageUiState.tableId;

						}
					} else {

						if (pageUiState.selectedTab !== undefined) {

							Logger.debug("[newPage] might keep UI state for tab, if I find it");
							// when deleting pageSplit, the model of the body already contains controls without the tabController, so we need to check:
							tabController = Utils.findFirstOfType(Capriza.Model.Control.getById(page.get("root")[0]), 'tabController');
							if (tabController) {
								Logger.debug("[newPage] keeping UI state for tab");
								pageView.getView(tabController.get("id")).setSelectedTab(pageUiState.selectedTab);
							}

							if (pageUiState.scrollPosition) {
								Logger.debug("[newPage] keeping UI state for scroll position (in tab)");
								Dispatcher.once("page/change/beforeTransition", function () {
									setTimeout(function () {
										Logger.debug("[newPage] actually keeping UI state for scroll position");
										pageView.getView(tabController.get("id")).getSelectedTabContent()[0].scrollTop = pageUiState.scrollPosition;
										delete pageUiState.scrollPosition;
										delete pageUiState.page;
									}, 0);
								});

							}
						}
						else if (pageUiState.scrollPosition) {
							if (Capriza.Model.ContextPage.compare(pageUiState.page, page)) {

								Logger.debug("[newPage] keeping UI state for scroll position (not in tab, passed compare)");
								Dispatcher.once("page/change/beforeTransition", function () {
									setTimeout(function () {
										pageView.scrollTo(0, pageUiState.scrollPosition);
										delete pageUiState.scrollPosition;
										delete pageUiState.page;
									}, 0);
								});

							} else {
								Logger.debug("[newPage] NOT keeping UI state for scroll position (not in tab, didn't pass compare)");
								delete pageUiState.scrollPosition;
								delete pageUiState.page;

							}
						}
					}
				}

				// check if this is the same context, and if so maintain the same scroll position
				if (currPageModel) {
					if (isSamePage) {
						var currScrollPosition = $.capriza.currentScrollPosition();
						Logger.debug("[newPage] got new page with the same context and controls (currScrollPosition=" + currScrollPosition + ")");
						transition = "none";
						Dispatcher.once("page/change/beforeTransition", function (e) {
							Logger.debug("[newPage] keeping UI state for scroll position (same page)");
							if (e.toPage.data("pageView") === pageView) {
								pageView.scrollTo(0, currScrollPosition);
							}
						});

						//TODO: we should definately refactor these +-40 lines!
						tabController = Utils.findFirstOfType(Capriza.Model.Control.getById(page.get("root")[0]), 'tabController');
						if (tabController && pageUiState && pageUiState.selectedTab) {
							Logger.debug("[newPage] keeping UI state for tab (same page)");
							pageView.getView(tabController.get("id")).setSelectedTab(pageUiState.selectedTab);
						}
					}

					if (currPageModel.tableDrill && page.get("keepUiState")) {

						Logger.debug('[newPage] current page is in drill');

						var rowControlId = currPageModel.get("rowControlId"), tableId = currPageModel.get("tableId");

						var tableIdInArray = Capriza.Model.Control.getById(page.get("root")[0]).getTablesInGroup();

						if (tableIdInArray.indexOf(tableId) > -1) {

							Logger.debug('[newPage] pushing the newpage and keeping in drill');

							$.capriza.pages.push(pageView.$el);
							pageView.getView(tableId).keepInDrill(rowControlId, currPageModel.get('parentPage').drillIndex);

							return;
						}
					}
				}

				// in case of a cdialog keep the new page, but don't show it
				if ($.capriza.activePage && $.capriza.activePage.hasClass('cdialog')) {
					$.capriza.pages.push(pageView.$el);
				} else {

					if (Utils.isCachedMVPShown()) {
						Dispatcher.trigger('mvp/newContentReady', {newOnlinePageView: pageView});
					}
					else {
						pageView.show({transition: transition});
					}

				}
			},

			modelId: function (response) {
				//Logger.debug("got model Id with: " + response.modelId);
				//Capriza.StateManager.setModelId(response.modelId);
			},

			loadState: function(response) {
				Capriza.StateManager.isSynced = true;

				Dispatcher.trigger("blueprint/removeNewVersionMessage");

				var structureUpdated, newStateStatus;
				if (response.structure) {
					structureUpdated = Capriza.EngineApi.Handlers.addStructure(response);
				}
				var currPageView = $.capriza.activePage && $.capriza.activePage.data("pageView"),
				    isCahcedBlueprintShown = Utils.isCachedBlueprintShown(),
				    modifiedState = response.state;

				if (!currPageView && $.capriza.activePage &&
					(
						($.capriza.activePage.prop("id") && $.capriza.activePage.prop("id").indexOf("dialog") === 0 ) ||
						$.capriza.activePage.hasClass("mini-browser")
					)){
					if ($.capriza.pages.length < 2){
						Logger.debug("loadState error - a prompt dialog or mini-browser is displayed and no active page was found.");
					}
					else{
						currPageView = $.capriza.pages[$.capriza.pages.length - 2].data("pageView");
					}
				}

				checkForSuccessfulLogin(response);

				Capriza.StateManager.restoreDisabled(response.state); // whether it's new state or update state, every control in the state that was ever synthetically disabled should now be restored.

				if (currPageView && currPageView.model && currPageView.model.get("contextId") == response.state.ctxId && !structureUpdated) {
					modifiedState = isCahcedBlueprintShown ? Capriza.EngineApi.Handlers._updateMissingInState(response.state) : modifiedState;
					Capriza.EngineApi.Handlers._updateState(modifiedState);
					isCahcedBlueprintShown && Dispatcher.trigger("blueprint/newContentReady");
					Capriza.StateManager.isCachedBlueprintShown = false;
				}
				else {
					Capriza.EngineApi.Handlers._newState(response);
				}

				//the location of this function should be after addStructure and before update/new State because
				//in case of a zapp without login, we need the structure saved to know if it is a login page, and to determine of we are
				//readyForCache before saveState
				setRequiresLogin(response);
				Capriza.Model.State.saveState(modifiedState.ctxId, modifiedState);

				//First page that is not login should be set as the MVP.
				Capriza.StateManager.checkIfShouldBeMVP(response.state && response.state.ctxId);

				Dispatcher.trigger("blueprint/stateLoaded");
			},

			//for first time run of _updateState when blueprint is shown, we need to set controls that are displayed
			//although no state have been received for them as MISSING
			_updateMissingInState: function (state){

				//go through all controls in the structure that are not in the state, that are not missing
				//and hide them (convert them to missing = true)
				var struct = Capriza.StateManager.structs[state.ctxId];
				var modifiedState = state;
				function updateMissingControlsRecursive(control) {
					if (control.controls)
						control.controls.forEach(updateMissingControlsRecursive);

					var currentModel = Capriza.Model.Control.getById(control.id);
					//if:
					// 1. the structure of the control is missing = true (the control is not mandatory)
					// 2. and the control does not exist in the state (the first state after blueprint sync) ==> it should be MISSING
					// 3. and the control is not currently missing.
					// 5. and the control is not current an "alt" for a missing control.
					//then: make it "missing" / "alt"
					if (control.missing && currentModel && !state.controls[control.id] && !currentModel.get("missing") && !currentModel.get("altDisplayed")){
						modifiedState.controls[control.id] = {missing: true};
					}
				}

				updateMissingControlsRecursive(struct);
				return modifiedState;
			},

			_updateState: function (state) {
				var removed = [];
				var addedAndModified = []; //together because of control order priority
				var isRecordMode = (window.isDesignerPreview || window.designerLoaded) && $("html").attr("designer-state") === "simplify";

				var page = Capriza.Model.PageDB[state.ctxId];
				var sortedControlIds = sortStateControls (state);

				sortedControlIds.forEach(function (ctrlId) {
					var control = _.extend({id: ctrlId}, state.controls[ctrlId]);
					var currentModel = Capriza.Model.Control.getById(ctrlId);
					control.isPageUpdate = false;

					if(!currentModel) {
						Logger.debug('Update state - no control found for id: ' + ctrlId);
						return;
					}

					if(currentModel.get("type") === "table" || currentModel.get("type") === "tabular") {
						if(control.phase || control.controls) {
							control.isPageUpdate = true;
						} else if(currentModel.get("phase") > 0) {
							control.phase = undefined;
							control.isPageUpdate = true;
						}
					}

					// TODO: if !currentModel -> exception/error
					if (isRecordMode) {
						var isPhantomStateChanged = false;
						// in record mode - setting missing/not missing doesn't delete the control - should only display it as phantom/not
						if (control.missing && !currentModel.get("isPhantom")) {
							isPhantomStateChanged = true;
							currentModel.set("isPhantom", true);
							delete control.missing;
						} else if (currentModel.get("isPhantom")) {
							isPhantomStateChanged = true;
							currentModel.set("isPhantom", undefined);
						}

						if (Object.keys(control).length > 1) {
							addedAndModified.push({processingType: 'modified', control: control});
						}
						if (isPhantomStateChanged) {
							_.each(currentModel.pages, function (page) {
								page.trigger("page/controlModified", ctrlId);
							});
						}
					} else {
						if (control.missing) {
							if (currentModel && !currentModel.missing) {
								if(currentModel.get("alt")) {
									var newControl = _.extend({}, currentModel.get("alt"), {isPageUpdate: true, altDisplayed: true});
									addedAndModified.push({processingType: 'modified', control: newControl});
								} else {
									removed.push(control);
								}
							}
							else {
								//already hidden
								//TODO: update the state in anycase ?
							}
						}
						else {

							//if the control is curretly missing and re-appearing
							if (currentModel && currentModel.get("missing") && !currentModel.get('altDisplayed')) {
								var mergedStructureState = _.extend({}, Capriza.StateManager.getStructureForControl(state.ctxId, control.id), control),
								    newControl = JSON.parse(JSON.stringify(mergedStructureState)); //copy in order not to change to original structure or state
								delete newControl.missing;
								addedAndModified.push({processingType: 'added', control: newControl});
							}
							else{
								if (currentModel && currentModel.get('altDisplayed')) {
									//if it has an "alt" stub control, this should be a pageUpdate in order to remove the stub and re-render the control.
									control.isPageUpdate = true;
								}
								addedAndModified.push({processingType: 'modified', control: control});
							}
						}
					}
				});

				if (addedAndModified.length > 0) {

					addedAndModified.forEach(function(controlToProcess){

						var processingType = controlToProcess.processingType,
						    control = controlToProcess.control;

						if (processingType == "modified") { //modified:
							if (control.isPageUpdate) {
								var id = control.id,
								    oldModel = Capriza.Model.Control.getById(id),
								    mergedStructureState = _.extend({}, Capriza.StateManager.getStructureForControl(state.ctxId, control.id), control),
								    newControl = JSON.parse(JSON.stringify(mergedStructureState)), //copy in order not to change to original structure or state
								    newModel = new Capriza.Model.Control(newControl, {parent: oldModel.parent});
								//if the new state is not missing, the attr may not be in the structure at all, so we need to "hard" set it.
								newModel.set('missing', control.missing);
								if (!control.missing && newModel.get('isPhantom')) newModel.unset('isPhantom', {silent: true});

								//for tables "missing" has no meaning, "missing" is stated by table.controls = [];
								//if (newModel.get("type") === "table" || newModel.get("type") === "tabular") newModel.unset("missing", {silent: true});

								newModel.addPage(oldModel.pages);
								_.each(newModel.pages, function (page) {
									page.trigger("page/controlModified", id);
								});
							}
							else {
								var controlUpdatesMsg = {
									mobileControls: [{id: control.id, data: control}]
								};
								Capriza.EngineApi.Handlers.controlUpdates(controlUpdatesMsg);
							}
						}

						else { //added
							var model = Capriza.Model.Control.getById(control.id);
							var controls = control.controls;
							delete control.id;
							delete control.controls;
							model.set("missing", undefined);
							model.set(control, {silent: true});
							//TODO: if !indexToAdd() - > exception/error
							model.pages[0].trigger("page/controlAdded", model.get("id"), model.parent.get("id"), indexToAdd(model));
							controls && model.setControls(controls);
						}

					});
				}

				if (removed.length > 0) {
					removed.forEach(function (ctrl) {
						var model = Capriza.Model.Control.getById(ctrl.id);
						model.set("missing", true);
					});
				}

				//#22182 - after all the updates, call page/update/after to call checkLastControl on the page, instead for every control update
				//         in order to allow the table to refresh first.
				//         There was a problem when the table (in MVP) was cached with yesMore = true, but in fact after sync, its actually yesMore=false.
				//         During the update of other control (e.g. back button), the checkLastControl called, and triggered getMoreItems.
				page.trigger("page/update/after");

				var eventData = {pageView: $.capriza.activePage.data("pageView")};
				Dispatcher.trigger("page/update/after", eventData);
			},

			newStateWithStructure: function (pageState, response) {
				response = response || {}; // TODO: better. response might not contain anything, all data on the pageState
				//"newPage"
				//TODO: refactor this to not use old newPage but a new refactored alternative !

				Logger.debug('handlers loading new state');

				var transition = Capriza.Model.firstContext ? undefined : "none";

				Dispatcher.trigger('header/errors/remove');

				var pageModel = response.blueprint ? new Capriza.Model.BlueprintPage(pageState) : new Capriza.Model.ContextPage(pageState);

				//if mvp page is shown, and we have recieved a new state that is not the login page or a failed login
				Utils.isCachedBlueprintShown() && Dispatcher.trigger("blueprint/newContentReady");

				var currPageView = $.capriza.activePage && $.capriza.activePage.data("pageView") && $.capriza.activePage.data("pageView");
				var currPageModel = currPageView && currPageView.model;

				pageModel.blueprint = response.blueprint;

				var pageView = pageState.login ? new Capriza.Views.LoginPage({model: pageModel}) :
					pageModel.mvp ? new Capriza.Views.MVPageView({model: pageModel}) :
						pageState.cnf ? new Capriza.Views.CNFPageView({model: pageModel}) :
							pageModel.blueprint ? new Capriza.Views.BlueprintPageView({model: pageModel}) :
								new Capriza.Views.ContextPage({model: pageModel});

				pageView = pageView.render();
				if (response.blueprint) pageView.$el.addClass("blueprint");

				var uniqueId = pageModel.get("uniqueId"), uiState = Capriza.Views.uiState, pageUiState = uiState["page" + uniqueId];
				take("pageInfo", {
						type: "pageInfo",
						uniqueId: uniqueId,
						mvp: pageModel.mvp,
						login: pageState.login,
						cnf: pageState.cnf,
						duration: Capriza.EngineApi.Handlers.calcPageDuration(),
						name: pageState.name
					}
				);

				if (pageModel.get("keepUiState") && pageUiState) {
					if (pageUiState.drillId) {
						if (pageModel.containsControl(pageUiState.tableId)) {
							Logger.debug("[newPage] keeping UI state for drill page");
							pageView.show({transition: "none"});
							pageView.getView(pageUiState.tableId).keepInDrill(pageUiState.drillId, pageUiState.drillIndex);
							delete pageUiState.drillId;
							delete pageUiState.tableId;
							return;

						} else {
							Logger.debug("[newPage] NOT keeping UI state for drill page");
							delete pageUiState.drillId;
							delete pageUiState.tableId;

						}
					} else {

						if (pageUiState.selectedTab !== undefined) {

							Logger.debug("[newPage] might keep UI state for tab, if I find it");
							// when deleting pageSplit, the model of the body already contains controls without the tabController, so we need to check:
							tabController = Utils.findFirstOfType(Capriza.Model.Control.getById(pageModel.get("root")[0]), 'tabController');
							if (tabController) {
								Logger.debug("[newPage] keeping UI state for tab");
								pageView.getView(tabController.get("id")).setSelectedTab(pageUiState.selectedTab);
							}

							if (pageUiState.scrollPosition) {
								Logger.debug("[newPage] keeping UI state for scroll position (in tab)");
								Dispatcher.once("page/change/beforeTransition", function () {
									setTimeout(function () {
										Logger.debug("[newPage] actually keeping UI state for scroll position");
										pageView.getView(tabController.get("id")).getSelectedTabContent()[0].scrollTop = pageUiState.scrollPosition;
										delete pageUiState.scrollPosition;
										delete pageUiState.page;
									}, 0);
								});

							}
						}
						else if (pageUiState.scrollPosition) {
							if (Capriza.Model.ContextPage.compare(pageUiState.page, pageModel)) {

								Logger.debug("[newPage] keeping UI state for scroll position (not in tab, passed compare)");
								Dispatcher.once("page/change/beforeTransition", function () {
									setTimeout(function () {
										pageView.scrollTo(0, pageUiState.scrollPosition);
										delete pageUiState.scrollPosition;
										delete pageUiState.page;
									}, 0);
								});

							} else {
								Logger.debug("[newPage] NOT keeping UI state for scroll position (not in tab, didn't pass compare)");
								delete pageUiState.scrollPosition;
								delete pageUiState.page;

							}
						}
					}
				}


				if (currPageModel && currPageModel.tableDrill && pageModel.get("keepUiState")) {

					Logger.debug('[newPage] current page is in drill');

					var rowControlId = currPageModel.get("rowControlId"), tableId = currPageModel.get("tableId");

					var tableIdInArray = Capriza.Model.Control.getById(pageModel.get("root")[0]).getTablesInGroup();

					if (tableIdInArray.indexOf(tableId) > -1) {

						Logger.debug('[newPage] pushing the newpage and keeping in drill');

						$.capriza.pages.push(pageView.$el);
						pageView.getView(tableId).keepInDrill(rowControlId, currPageModel.get('parentPage').drillIndex);

						return;
					}
				}

				// in case of a cdialog keep the new page, but don't show it
				if ($.capriza.activePage && $.capriza.activePage.hasClass('cdialog')) {
					$.capriza.pages.push(pageView.$el);
				} else {
					pageView.show({transition: transition});
				}
			},

			_newState: function (response) {
				var state = response.state;
				//Check if the newState is for a login page and we already have a state saved for the login page.
				//In that case, it is possible that the auto-login had failed, and we receive an update in the login page.
				//Need to merge the new state with the former login state - #20264 (otherwise button labels are lost)
				if (Capriza.StateManager.structs[state.ctxId] && Capriza.StateManager.structs[state.ctxId].login && Capriza.StateManager.states[state.ctxId]){
					Logger.debug("[Blueprint] Received another state for Login page as new state, merging with former state");
					state = Capriza.StateManager.mergeStates(Capriza.StateManager.states[state.ctxId].default, state);
				}
				var pageState = Capriza.StateManager.mergeStructureState({state: state, structure: response.structure && response.structure[0]});
				if (pageState.login)
					processLoginMessage(pageState, response);
				else {
					this.newStateWithStructure(pageState, response);
					Capriza.StateManager.isCachedBlueprintShown = false;
				}
			},

			addStructure: function (response) {
				//check first if we already have these structure, becuase of #19570, in android the background run doesn't
				//save the allStruct and modelId in the localStorage. So we could have a situation where we have a structure that is not
				//in allStructs, meaning after mobile-engine sync, the structure would be sent to the mobile again. In that case
				//we need to ignore it.
				var newStructures = ignoreExistingStructures(response.structure);

				Capriza.StateManager.addStructure(newStructures);

				return newStructures.length > 0;
			},

			changeStruct: function (response) {
				Capriza.StateManager.updateStructure(response);
				var isRecordMode = (window.isDesignerPreview || window.designerLoaded) && $("html").attr("designer-state") === "simplify";

				var removed = response.removed || [],
				    added = response.added ? Object.keys(response.added).map(function (mcIdKey) {
					    var addedObj = response.added[mcIdKey],
					        result = {
						        id: mcIdKey,
						        index: addedObj.index,
						        parent: addedObj.parent,
						        control: _.extend(addedObj.struct, addedObj.state)
					        };
					    // When a control is optional we get missing in the struct, but visibility missing is in the state
					    if (addedObj.state && result.control.missing) {
						    result.control.missing = addedObj.state.missing;
					    }
					    if (isRecordMode && result.control.missing) {
						    result.control.isPhantom = true;
					    }
					    return result;
				    }) : [],
				    modified = response.modified ? Object.keys(response.modified).map(function (mcIdKey) {
					    var modifiedObj = response.modified[mcIdKey];
					    var result = {id: mcIdKey, control: _.extend(modifiedObj.struct, modifiedObj.state)};
					    if (modifiedObj.state && result.control.missing) {
						    result.control.missing = modifiedObj.state.missing;
					    }
					    if (isRecordMode && modifiedObj.struct.missing && (!modifiedObj.state || modifiedObj.state.missing)) {
						    result.control.isPhantom = true;
					    }
					    return result;
				    }) : [],
				    pageModel = Capriza.Model.ContextPage.getByContextId(response.ctxId), // TODO: getByContextId hypothetically should return an array of pages
				    eventData = {
					    added: added.map(function (addedObj) {
						    return addedObj.id;
					    }),
					    removed: removed,
					    modified: modified.map(function (modifiedControl) {
						    return modifiedControl.id
					    }),
					    response: response // TODO: check response.cached because someone is listening!!!
				    };

				if (!pageModel) {
					Logger.error("pageUpdate for non existing contextId", undefined, "pageUpdateOfMissingPage", "contextId: " + response.ctxId);
				}

				Dispatcher.trigger("page/update/before", eventData);

				if (pageModel) {
					pageModel.trigger("page/update/before", eventData);
				}

				_.each(removed, function (controlId) {
					var model = Capriza.Model.Control.getById(controlId);
					if (model) {
						model.removeFromParent();
					}

					if (pageModel.get("backControl") && (pageModel.get("backControl").id === controlId)) {
						pageModel.unset("backControl");
						Dispatcher.trigger("backButton/hide");
					}
				});

				_.each(added, function (addedObj) {
					var index = addedObj.index;
					var control = addedObj.control;
					var parentId = addedObj.parent;

					var existingModel = Capriza.Model.Control.getById(control.id);
					if (existingModel && existingModel.pages.indexOf(pageModel) > -1) {
						// todo: handle case of added for control that is already present and currently phantom
						if (existingModel.get('isPhantom')) {
							modified.push(control);
						}
						else {
							return;
						}
					}
					else {
						var parent = Capriza.Model.Control.getById(parentId),
						    model = new Capriza.Model.Control(control, {parent: parent});

						parent.get("controls").splice(index, 0, model);

						model.addPage(pageModel);
						pageModel.trigger("page/controlAdded", model.get("id"), parentId, index);
					}


				});

				_.each(modified, function (modifiedObj) {
					var id = modifiedObj.id,
					    oldModel = Capriza.Model.Control.getById(id),
					    newModel = new Capriza.Model.Control(modifiedObj.control, {parent: oldModel.parent});

					newModel.addPage(oldModel.pages);
					_.each(newModel.pages, function (page) {
						page.trigger("page/controlModified", id);
					});
				});

				pageModel && pageModel.trigger("page/update/after");
				eventData.pageView = $.capriza.activePage.data("pageView");
				Dispatcher.trigger("page/update/after", eventData);
			},

			calcPageDuration: function () {

				var currDuration = Date.now() - Capriza.pageTimer;
				return currDuration;
			},

			pageUpdate: function (response) {
				var removed = response.removed || null,
				    added = response.added ? response.added.sort(function (x, y) {
					    return x.index > y.index ? 1 : (x.index < y.index ? -1 : 0)
				    }) : [],
				    modified = response.modified || null,

				    // TODO: getByContextId hypothetically should return an array of pages
				    pageModel = Capriza.Model.ContextPage.getByContextId(response.contextId),

				    eventData = {
					    added: added.map(function (addedObj) {
						    return addedObj.control.id;
					    }),
					    removed: removed.map(function (removedObj) {
						    return removedObj.controlId;
					    }),
					    modified: modified.map(function (modifiedControl) {
						    return modifiedControl.id
					    }),
					    response: response
				    };

				if (!pageModel) {
					Logger.error("pageUpdate for non existing contextId", undefined, "pageUpdateOfMissingPage", "contextId: " + response.contextId)
				}

				Dispatcher.trigger("page/update/before", eventData);

				if (pageModel) {
					pageModel.trigger("page/update/before", eventData);
				}

				_.each(removed, function (removedObj) {
					var controlId = removedObj.controlId;
					var model = Capriza.Model.Control.getById(controlId);
					if (model) {
						model.removeFromParent();
					}

					if (pageModel.get("backControl") && (pageModel.get("backControl").id === removedObj.controlId)) {
						pageModel.unset("backControl");
						Dispatcher.trigger("backButton/hide");
					}
				});

				_.each(added, function (addedObj) {
					var index = addedObj.index;
					var control = addedObj.control;
					var parentId = addedObj.parent;

					var existingModel = Capriza.Model.Control.getById(control.id);
					if (existingModel && existingModel.pages.indexOf(pageModel) > -1) {
						if (existingModel.get('isPhantom')) {
							modified.push(control);
						}
						else {
							return;
						}
					}
					else {
						var parent = Capriza.Model.Control.getById(parentId),
						    model = new Capriza.Model.Control(control, {parent: parent});

						if (parent){
							parent.get("controls").splice(index, 0, model);

							model.addPage(pageModel);
							pageModel.trigger("page/controlAdded", model.get("id"), parentId, index);
						} else {
							Logger.error("No parent control on Handle Page update, parentId: " + parentId + ", for controlId: "+ control.id);
						}
					}
				});

				_.each(modified, function (modifiedControl) {
					var id = modifiedControl.id,
					    oldModel = Capriza.Model.Control.getById(id),
					    newModel = new Capriza.Model.Control(modifiedControl, {parent: oldModel.parent});

					newModel.addPage(oldModel.pages);
					_.each(newModel.pages, function (page) {
						page.trigger("page/controlModified", id);
					});
				});

				pageModel && pageModel.trigger("page/update/after");

				eventData.pageView = $.capriza.activePage.data("pageView");
				Dispatcher.trigger("page/update/after", eventData);
			},

			controlUpdates: function (response) {
				Dispatcher.trigger("control/updates/before", response);

				pageManager.updateControls(response.mobileControls);
				Dispatcher.trigger("control/updates", response.mobileControls, response);
				//Capriza.updateControls(response);
			},

			modalDialog: function (response) {
				Dispatcher.trigger("blueprint/removeNewVersionMessage");
				pageManager.generateDialog(response);
				checkForSuccessfulLogin(response);
			},

			obsoleteEvent: function() {},

			loading: function (response) {
				Capriza.isLoading = true;

				var options = {
					message: response.message,
					maxAutomations: response.maxAutomations
				};
				if (response.stopBlocking !== true){
					Dispatcher.trigger("loading/start", options);
				}
				else Dispatcher.trigger("loading/stopBlocking");

				if (Capriza.designerMode && Capriza.designerMode === "simplify") return;

				if (Capriza.splashing) {
					if (response.message) {
						Capriza.splashRenderAuthMessage(response.message, options);
						Dispatcher.trigger("loading/automationMessage");

					}
				} else if (!Capriza.inDummyLoadingPage) {
					pageManager.showLoadingMsg(options);
				}
			},

			error: function (response) {
				Logger.debug('handling error');
				Dispatcher.trigger("blueprint/removeNewVersionMessage");
				pageManager.generateErrorPage(response);
			},


			contextNotFound: function (response) {
				Logger.tag("handlingCNF");
				Dispatcher.trigger("blueprint/removeNewVersionMessage");
				Dispatcher.trigger("application/contextNotFound", response);
				Capriza.EngineApi.Handlers.newPage(response);
				checkForSuccessfulLogin(response);
			},

			fatal: function (response) {
				Dispatcher.trigger("blueprint/removeNewVersionMessage");
				if (Capriza.splashing) {
					Dispatcher.trigger('splash/clearTimeout');
				}
				Dispatcher.trigger("application/fatalError");
				Logger.debug('fatal error occured');
				var options = {id: "fatal-error"};

				var closeZapp = $("#settings-close-zapp");
				if (Capriza.isStore) {
					closeZapp.removeClass('inactive');
				}

				var pm = new Capriza.Model.Page(options);
				var pv = new Capriza.Views.PageView({model: pm}).render();
				var messageContent;

				if (window.isDesignerPreview) {
					messageContent = "Please start over or go back to dashboard and try again";
				} else {
					messageContent = "Please exit and try again";
				}

				pv.addContent($(Handlebars.templates['cnfPage']({'title': response.reason, 'content': messageContent})));
				pv.show();

			},

			getIdentity: function (response) {
				Logger.debug('handling getIdentity ' + Date.now());
				Dispatcher.trigger("blueprint/removeNewVersionMessage");
				function sendIdentity(identity, saveCredentials) {
					pageManager.sendIdentity(identity, response.host, saveCredentials);
				}

				Dispatcher.trigger('page/loginPage');
				Capriza.getIdentity(sendIdentity, response);

				checkForSuccessfulLogin(response);
				setRequiresLogin(response);
			},

			moreItems: function (response) {
				Logger.debug('handling moreItems');
				var control = Capriza.Model.Control.getById(response.controlId);
				var controls = response.controls.map(function (c) {
					return new Capriza.Model.Control(c, {parent: control, pages: control.pages});
				});
				control.attributes.controls = control.attributes.controls.concat(controls);
				control.set("yesMore", response.yesMore);
				_.each(control.pages, function (page) {
					page.trigger("page/moreItems", control, response.startIndex);
				});
			},

			zappRedirect: function (response) {
				Logger.debug('handling zappRedirect');
				ComManager.redirect(response.zappId);
			},

			download: function (response) {
				pageManager.downloadFile(response);
				checkForSuccessfulLogin(response);
			},

			snapshot: function (response) {
				logger.info("runtime feedback sent");
			},

			css: function (response) {
				$("style#custom-css").remove();
				response.css && $("<style id='custom-css'>").text(response.css).appendTo("head");
			},

			stopLoading: function () {
				// the main.js controller takes off the loading on any response that is not 'loading' (unless stopBlocking == false)
			},

			cookies: function (response) {
				var cookies = JSON.parse(ClientCache.getItem("authCookies") || "[]");
				response.cookies.remove.forEach(function (expr) {
					var re = new RegExp(expr);
					cookies = cookies.filter(function (cookie) {
						return !re.test(cookie.name);
					});
				});

				response.cookies.add.forEach(function (newCookie) {
					for (var i = 0; i < cookies.length; ++i) {
						var oldCookie = cookies[i];
						if (oldCookie.name == newCookie.name && oldCookie.host == newCookie.host && oldCookie.path == newCookie.path
							&& oldCookie.isDomain == newCookie.isDomain && oldCookie.isSecure == newCookie.isSecure) {
							oldCookie.value = newCookie.value;
							return;
						}
					}
					cookies.push(newCookie);
				});
				ClientCache.setItem("authCookies", JSON.stringify(cookies));
				var cookiesMap = JSON.parse(ClientCache.getItem("authCookiesZappMap") || "{}");
				cookiesMap[location.pathname] = response.cookies.active;
				ClientCache.setItem("authCookiesZappMap", JSON.stringify(cookiesMap));
			},

			offlineEnd: function (response) {

				Capriza.Views.MVPageView.reportToWrapper('background/mvpCached', response);
			},

			caching: function (response) {
				response.cacheMobileControls.forEach(function (mcObj) {

					//var mcId = mcObj.mcId; // mcObj is {"mcId":"mc1634","interacted":true}
					//var model = Capriza.Model.Control.getById(mcId);
					//if(model && model.saveToCache){
					//    model.saveToCache();
					//}
				});
			},

			dataStoreWrite: function (data) {
				if (!window.isDesignerPreview) {
					Dispatcher.trigger('mobile/setToZappDB', {key: 'dataStore', value: data.data});
					Logger.debug('received dataStoreWrite: ' + JSON.stringify(data));
				}
				else {
					Logger.debug('ignoring dataStoreWrite in designer');
				}

			},

			closeSession: function () {
				Logger.debug('received closeSession. doing nothing.');
				Dispatcher.trigger('mobile/closeSessionReceived');
			},

			locale: function (data) {
				var locale = data.locale;
				Logger.debug('received locale: ' + locale);
				Capriza.translator.init(locale);
			},

			tiles: function (data) {
				Logger.debug('received tiles ' + JSON.stringify(data));
				Dispatcher.trigger('mobile/setToZappDB', {key: 'tiles', value: data.data});
			},

			invalidRTParams: function (data) {
				Logger.debug('received invalidRTParams ' + JSON.stringify(data));
				Dispatcher.trigger('rtParams/invalid', data);
			},

			ack: function (data) {
				Logger.debug('received ack ' + JSON.stringify(data));
				Dispatcher.trigger("message/ack", data);
			}
		};

		Capriza.EngineApi.Handlers.Utils = {};

		/**
		 Process a new login message (an update on an existing, rendered login page should be handled by _updateState)
		 */
		function processLoginMessage(pageState, response){

			var loginModel = new Capriza.Model.LoginPage(pageState);
			Logger.debug("[processLoginMessage] received a message for a login page");

			//if we are in the process of auto login, and this update is a "failed" auto-login,
			//if we are not in auto-login that has failed, try to perform auto login.
			//if that failed (e.g. we have no creds), trigger auto-login failed to render the login page, and return true.
			if ((Capriza.LoginManager.autoLoginPerformed == loginModel.get("contextId") && isFailedAutoLogin(response)) ||
				!Capriza.LoginManager.tryToPerformAutoLogin(loginModel)){
				Logger.debug("[processLoginMessage] triggering login/auto/failed");
				Dispatcher.trigger("login/auto/failed", loginModel);
				Utils.isCachedBlueprintShown() && Dispatcher.trigger("blueprint/newContentReady");
			}
		}

		/**
		 This function determines whether or not this zapp requires login (readyForBackground, cachedMVP).
		 For the background run - to know if the zapp is ready for background run (currently in terms of credentials).
		 For Cached MVP - should the cached mvp page saved or not:
		 1. There is no login in the zapp.
		 2. There is a login (one or more), and these were successful (not pending), and the credentials were saved!
		 */
		function setRequiresLogin(response){
			if (!response) return;

			var loginRequiredInTheZapp, loginIsPending, credentialsAreSavedForHosts, credentialsAreSavedForContexts, credentialsAreSaved;

			loginRequiredInTheZapp = Capriza.LoginManager.isLoginRequired();
			loginIsPending = Capriza.LoginManager.isLoginPending();
			//check if credentials are saved:
			//need to check both for hosts and for contexts - consider NTLM (only host, no context), on the other hand, consider 2 login pages with the same host (host saved, 2nd context is not)
			credentialsAreSavedForHosts = !_.some(Capriza.LoginManager.credentialsSavedForHosts, function(credentialsSavedForHost){return !credentialsSavedForHost});
			credentialsAreSavedForContexts = !_.some(Capriza.LoginManager.credentialsSavedForContexts, function(credentialsSavedForContext){return !credentialsSavedForContext});
			credentialsAreSaved = credentialsAreSavedForHosts && credentialsAreSavedForContexts;

			//determine if the Zapp is ready (in terms of credentials) for background run and to cache the MVP page.
			//either login is not required, or (if the login is required), it's not pending, and the all the required credentials are saved
			var ready = !loginRequiredInTheZapp || (!loginIsPending && credentialsAreSaved);
			Logger.info("[setRequiresLogin] zapp readyness for background and cached MVP: " + ready);
			Dispatcher.trigger("mobile/setToZappDB", {key: 'readyForBackground', value: ready});
			Capriza.StateManager.readyForCaching = ready;
		}

		/**
		 This function determines if this message from the Engine is considered as a login success (of the pending login).
		 This update will be considered a success (assuming there is a pending login) in the following cases:
		 1. resultType == 'download'
		 2. This message is NTLM (getIdentity), and the pending login is a regular (context) login.
		 3. This message is NTLM (getIdentity), and the pending login is also an NTLM but for a DIFFERENT host.
		 4. This is a loadState message, while the pending login is NTLM.
		 5. This is a loadState message, while the pending login is a regular (context) login,
		 for a different context, that is not marked as "loginFailed" page.

		 If this Engine message is considered a successful login, an mobile/login/success event is triggered.
		 Otherwise, nothing happens.
		 */
		function checkForSuccessfulLogin(response){
			var loginSuccessful;

			if (!Capriza.LoginManager.isLoginRequired()) {
				Logger.info ("[checkForSuccessfulLogin] Zapp currently does not require login");
				return;
			}

			if (Capriza.LoginManager.isLoginPending()) { //if there is no login pending, meaning all hosts are logged in-to successfully

				Logger.debug("[checkForSuccessfulLogin] Zapp requires login and it is pending..");

				//for download messageTypes, assuming successful login
				if ( response.resultType == "download" ) {
					loginSuccessful = true;
					Logger.debug("[checkForSuccessfulLogin] Got " + response.resultType + " while login pending, assuming successful login");
				}
				else if (response.resultType == "getIdentity") {
					//check if there is a context pending (regular login, not NTLM), ASSUMPTION: only one "false" (pending) context at a time
					var contextPending = Capriza.LoginManager.getContextPendingLogin(),
					    ntlmForDifferentHost = Capriza.LoginManager.getHostPendingLogin() != response.host;
					//if there is a context pending (regular login pending), this means it was a success.
					if (contextPending) {
						loginSuccessful = true;
						Logger.debug("[checkForSuccessfulLogin] Received getIdentity while context login is pending, setting the former as a successful login");
					}
					if (!contextPending && ntlmForDifferentHost) {
						loginSuccessful = true;
						Logger.debug("[checkForSuccessfulLogin] Received getIdentity while a previous NTLM login is pending, since this is for a different host, setting the former as a successful login");
					}
				}
				else if (response.resultType == "loadState") {
					var contextPending = Capriza.LoginManager.getContextPendingLogin();
					if (!contextPending) {
						loginSuccessful = true;
						Logger.debug("[checkForSuccessfulLogin] Received loadState when login is pending with no context (NTLM), setting the former as successful");
					}
					else if (contextPending != response.state.ctxId) { // if the current message is for a different context (than the pending login one).
						//this could be either the next page in the Zapp => login success; or a login failed page => failed login
						var currentStructure = Capriza.StateManager.structs[response.state.ctxId];
						loginSuccessful = !currentStructure.failedLogin;
						Logger.debug("[checkForSuccessfulLogin] Received loadState for a different context (failedLogin flag = '"+ currentStructure.failedLogin +"') while login is pending, setting the former as " + (loginSuccessful ? 'successful' : 'failed') + " login");
					}
				}
			}

			//Does this update considered as login success?
			if (loginSuccessful) {
				Dispatcher.trigger("mobile/login/success");
			}
		}

		/**
		 * Sorts the controls of the state according to the position in the structure hierarchy.
		 * The higher the control is in the hierarchy of the structure (container), the earlier it will be in the sorted array.
		 */
		function sortStateControls(state){
			if (!state || !state.controls) return [];

			var ids = Object.keys(state.controls);
			if (ids.length == 1) return ids;

			var sortedStructureControls = Capriza.StateManager.getStructureControlsSorted(state.ctxId);
			var sortedControlIds = ids.sort(function(c1, c2){
				return sortedStructureControls.indexOf(c1) - sortedStructureControls.indexOf(c2);
			});

			return sortedControlIds;
		}

		function indexToAdd(model) {
			var idxI = 0, idxRet;
			model.parent.get("controls").forEach(function (ctrl) {
				if (ctrl.get("id") == model.get("id")) {
					idxRet = idxI;
				}
				else if (!ctrl.get("missing")) {
					idxI++;
				}
			});
			return idxRet;
		}

		function ignoreExistingStructures(structures){
			if (!structures) return;

			if (!window.isDesignerPreview && !window.designerLoaded)
				return structures.filter(function(struct){
					return !Capriza.StateManager.structs[struct.contextId]});

			return structures;
		}

		function isFailedAutoLogin(response){
			var whiteListProps = ['lastMsgId'];

			//go through all the controls in the received state, and look for one that has un-skippable update ==> failed login
			var loginFailed = _.some(response.state.controls, function(controlState, controlId){
				var controlStruct = Capriza.StateManager.getStructureForControl(response.state.ctxId, controlId);

				if (!controlStruct) {
					Logger.debug("[isFailedLogin] ERROR: structure for control '" + controlId + "' in context '" + response.state.ctxId + "' not found.");
					return;
				}
				if (!controlStruct.autoLoginSkipUpdates){
					Logger.debug("[isFailedLogin] got update on control without autoLoginSkipUpdates --> failed login (id = '" + controlId + "')");
					return true;
				}
				else { //there shouldn't be even one prop that cannot be skipped
					return _.some(controlState, function(propValue, propName){
						var updateCannotBeSkipped = whiteListProps.indexOf(propName) == -1 && controlStruct.autoLoginSkipUpdates.indexOf(propName) == -1;
						if (updateCannotBeSkipped){
							Logger.debug("[isFailedLogin] found a control update that cannot be skipped. controlId: " + controlId + ", updated property: " + propName + "='" + propValue + "'");
							return true;
						}
						return false;
					});
				}
			});

			Logger.debug("[isFailedAutoLogin] checking for failed auto login: " + loginFailed);
			return loginFailed;
		}

		//for unit tests
		Capriza.EngineApi.Handlers.Utils.checkForSuccessfulLogin = checkForSuccessfulLogin;
		Capriza.EngineApi.Handlers.Utils.setRequiresLogin = setRequiresLogin;
		Capriza.EngineApi.Handlers.Utils.sortStateControls = sortStateControls;
		Capriza.EngineApi.Handlers.Utils.ignoreExistingStructures = ignoreExistingStructures;
		Capriza.EngineApi.Handlers.Utils.isFailedLogin = isFailedAutoLogin;

	})();

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/main.js

try{
	/**
	 * Created by JetBrains WebStorm.
	 * User: ycarmel
	 * Date: 9/7/11
	 * Time: 11:46 PM
	 */

	(function () {

		window.handleResponse = function (response) {
			try {
				if (!response.op || response.op == 'ROUTE') {

					Dispatcher.trigger("engine/message", response);

					if (response.resultType !== 'loading' && !Capriza.firstPage) {
						Capriza.firstPage = true;
						take("firstPage");
						take.startReason = response.resultType;
					}
					logger.log('handling '+response.resultType);

					if (!window.isDesignerPreview && response.mvp && !Utils.isInDevMode() && !Utils.isInDashboard()) {
						var responseClone = $.extend(true, {}, response);
					}


					var handler = Capriza.EngineApi.Handlers[response.resultType];

					if (handler) {
						handler(response);
					} else {
						pageManager.generateErrorPage({reason: 'Received unknown result type: '+response.resultType});
					}

					Dispatcher.trigger('engine/message/after', response);


				} else if (response.op == 'SERVER_MESSAGE') {//SERVER_MESSAGE is only pre close socket messages.
					ComManager.serverMessageEndSent = true;
					pageManager.generateErrorPage({nonFatal:true, reason:response.content});
					ComManager.onEndMessageReceived();
					Dispatcher.trigger("handleResponseError", response);
				}
			} catch (e) {
				pageManager.handleException(e);
			}
		};

		function send(operation, event) {
			try {
				setTimeout(function () {
					pageManager.handleRequest(operation, event);
				}, 0);
			} catch (e) {
				pageManager.handleException(e);
			}
		}

		pageManager.handleException = function (e) {
			var ex = e || {};
			try {
				ex.errorType = 'unhandledException';
				ex.stack = e.stack; //stack and message are getters and not real properties so it is not serialized automatically.
				ex.errorMessage = e.message;
				Logger.error("Unhandled exception occurred", ex, 'unhandledException');
			} catch (exInner) {
			}
			throw e;
		};


		pageManager.triggerEvent = function (event) {
			pageManager.addMobId(event);
			send('ROUTE', event);
		};

		Capriza.mcLastMobId = {};

		pageManager.addMobId = function(event){
			if(event.type !== "bulk" ) {
				event.msgId = "mob" + pageManager.actionCounter++;
				if (event.type == "mcAction") Capriza.mcLastMobId[event.controlId] = event.msgId;
			}
			return event;
		};

		pageManager.handleRequest = function (operation, event) {
			if (window.ComManager) {
				window.ComManager.send(operation, event);
			}

		};

		pageManager.showLoadingMsg = function (options) {
			if ((Utils.isCachedMVPShown("mvppp") || Utils.wasCachedMVPShown()) && Utils.isUnimessageShown()) return;
			if(Utils.isCachedBlueprintShown()) return;
			$.capriza.showLoadingMsg(undefined, options); // NOTE: sending true means isClient, which isn't really the case, but we changed implementation so that also server side loading will show the spinner for a 1.5sec

		};

		pageManager.hideLoadingMsg = function () {
			$.capriza.hideLoadingMsg();

		};

		pageManager.sendIdentity = function (identity, host, saveCredentials) {
			Logger.debug('sending login (identity) now '+Date.now());

			var identityMsg = {type:"identity", identity:identity, host:host, encrypt:true};
			Capriza.LoginManager.addMessageForBulk(identityMsg);
			saveCredentials && Capriza.LoginManager.writeCredentialsToFile();
			pageManager.triggerEvent(identityMsg);
		};


		window._handleResponse = function(response) {
			window.handleResponse(JSON.parse(response));
		};

		window.previewModeSetup = function (handler) {
			Capriza.previewMode = true;
			pageManager.handleRequest = function (operation, event) {
				handler.hr(event, _handleResponse);
			};

			ComManager.connectionInit(send);
		};

		window.setUserSession = function (data) {
			data.userSessionData = true;
			pageManager.triggerEvent(data);
		};



//    debug
		var debug=window.debug = $.extend({}, window.debug);
		debug.responses = [];
		debug.actions = [];
		debug.records = [];
		debug.interactions = [];


		//    used for monitoring purposes, sent updated on every action
		pageManager.actionCounter=0;

		var originalHandleResponse = window.handleResponse;

		window.handleResponse = function () {
			var engineResponse = $.extend(true,{},arguments[0]);

			engineResponse.timestamp = Date.now();
			var self = this, origArg = arguments;

			if (Capriza.messageQueue){
				Logger.info ("[main.js] Engine message received. Saving it to a queue (not processing it). messageType: " + engineResponse.resultType);
				Capriza.messageQueue.push (
					new Utils.QueueTask({
						name: 'handleResponse-' + engineResponse.resultType,
						async: false,
						taskFunction: function(){runWrappedHandleResponse.apply(self, origArg)}
					})
				);
			}
			else runWrappedHandleResponse.apply(this, arguments);

		};

		function runWrappedHandleResponse(){
			var engineResponse = $.extend(true,{},arguments[0]),
			    profileEvent;
			if (Capriza.Profiler && Capriza.Profiler.on) {
				profileEvent = new Capriza.Profiler.ProfileEvent({direction: "eng-mob",async:true});
				profileEvent.eventData = Utils.flattenObject(engineResponse);
				profileEvent.data.msgId = engineResponse.msgId;
			}
			engineResponse.timestamp = Date.now();
			debug.responses.push(engineResponse);
			debug.records.push(engineResponse);
			originalHandleResponse.apply(this, arguments);

			if (Capriza.Profiler && Capriza.Profiler.on) {
				profileEvent.end && profileEvent.end();
			}
		}

		var originalTriggerEvent = pageManager.triggerEvent;

		pageManager.triggerEvent = function () {
			var mobileAction = $.extend(true,{},arguments[0]);

			if(mobileAction.encrypt){
				if(mobileAction.identity){
					_.each(mobileAction.identity,function(value,key){mobileAction.identity[key]="******"})
				}else{
					mobileAction = {
						type:"mcAction",
						controlId: mobileAction.controlId,
						contextId: mobileAction.contextId,
						action: mobileAction.action,
						value:"$$Encrypted$$",
						auto: mobileAction.auto
					};
				}

			}
			mobileAction.timestamp = Date.now();


			if (Capriza.Profiler && Capriza.Profiler.on) {
				var profileEvent = new Capriza.Profiler.ProfileEvent({direction: "mob-eng",async:true});

				profileEvent.eventData = Utils.flattenObject(mobileAction);


				profileEvent.data.msgId = "mob" + pageManager.actionCounter;


			}

			debug.actions.push(mobileAction);
			debug.records.push(mobileAction);


			originalTriggerEvent.apply(this, arguments)
		};

		// protecting from appcache not updated (TODO: dor to fix)
		if (window.takeJSExecute) window.takeJSExecute("jsExecuteEnd");

		function holdEngineMessages(){
			//create the message queue:
			Capriza.messageQueue = new Utils.Queue('messageQueue');
			var queueTask = new Utils.QueueTask({
				name: 'mobile/handlers/stop',
				async: true,
				taskFunction: function(finishCallback){
					//wait for the handlers to resume
					Dispatcher.once ("mobile/handlers/resume", function(){
						//once the handlers are resumed, start processing all the messages in the queue, and when it is finished
						//(the 'empty' event), remove the queue
						Logger.info("[main.js] received mobile/handlers/resume event, start to process the messages");
						Capriza.messageQueue.on('empty', function(){
							Logger.info("[main.js] messageQueue has emptied, deleting the queue");
							Capriza.messageQueue = null;
						});
						finishCallback && finishCallback();
					});
				}
			});

			Capriza.messageQueue.push (queueTask);
		}

		//currently on once is supported
		Dispatcher.once("mobile/handlers/stop", holdEngineMessages);
	})();


}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: javascripts/BackButtonManager.js

try{
	/**
	 * Created by Bar on 12/30/13.
	 * Manage the native back button
	 */

	(function(){
		function init(){

			// Versions of browsers supported:
			// IE >= 10
			// FF >= 4
			// Chrome >= 5
			// Safari >= 5
			// Opera >= 11.5
			// iOS >= 5
			// Blackberry >= 7
			// Android: 2.2 2.3 4.2 4.3 4.4
			var isPlatformSupportPushState = !!(window.history && window.history.pushState);
			var isFlag = window.appData && window.appData.config.androidBackButtonDisabled;
			if (!Capriza.device.android || !isPlatformSupportPushState || isFlag) return;

			// when running in non-local environments we get to this line of code after the has been already loaded.
			if (document.readyState != "complete") {

				// In some browsers popstate is triggered when the browser finishes loading. So adding setTimeout(0) solves this
				window.addEventListener("load", function() {
					setTimeout(enableBackButton, 0)
				});
			} else {
				setTimeout(enableBackButton, 0);
			}

			Logger.debug("Android back button is active");
		}

		/**
		 * Let the user use the native back button
		 */
		function enableBackButton() {

			/**
			 * adds the custom history entry.
			 * When there the stack contains at least one Capriza state, the browser will remain in the zapp even though
			 * any native backbutton is clicked
			 */
			function addHistory() {
				Logger.debug("BB history added");
				var prefixUrlIndex = document.URL.lastIndexOf('/');
				window.history.pushState({capriza: "stackManagement"}, "Capriza", document.URL.substring(prefixUrlIndex + 1));
			}

			function exit(){
				if(Capriza.isAppZapp) {
					window.close();
				}
				else if (Capriza.isPhonegap){
					Dispatcher.trigger("app/close"); // use the logic of close zapp button
				} else {
					window.removeEventListener("popstate", onNativeBackButtonClicked);
					window.history.go(-2);
				}
			}

			function isDialogPage(){
				return $.capriza.activePage && $.capriza.activePage.hasClass('cdialog') && $.capriza.activePage.hasClass('confirm');
			}

			function isMobiscrollDialogOpen(){
				var isOpen = false;
				Object.keys($.mobiscroll.instances).forEach(function(inst){
					isOpen = isOpen || $.mobiscroll.instances[inst].isVisible();
				});
				return isOpen;
			}

			function isBubbleOpen(){
				return $('.bubble-content.active').length > 0;
			}

			function isCnfPage(){
				return $.capriza.activePage && $.capriza.activePage.attr('id') === 'context-not-found';
			}

			function isDropdownPopoverOpen(){
				return $(".popover-dropdown.active, .modal-dropdown.active").length > 0;
			}

			function isFeedbackPage(){
				return $('#feedback-page').hasClass('active');
			}

			function isFeedbackPageInTransit(){
				return $('#feedback-page').hasClass('transitioning');
			}

			function isBackButtonVisible(){
				return $('.back-button.active').length > 0;
			}

			function isUIBlocked(){
				return $("#viewport-overlay").hasClass('active') && !$("#viewport-overlay").hasClass("side-menu");
			}

			function clickOnBackButton(){
				$('.back-button.active').click();
			}

			function clickOnCNFBackButton(){
				$("#cnf-back").click();
			}

			function clickOnDialogCancelButton(){
				$('.real-button.dialog-cancel', $.capriza.activePage).click();
			}

			function closeMobiscrollDialog(){
				Object.keys($.mobiscroll.instances).forEach(function(inst){
					$.mobiscroll.instances[inst].cancel();
				});
			}

			function isConfirmMessage(){
				return $(".confirmer").length;
			}
			function closeConfirmMessage() {
				var $confirmMessageClose = $(".confirmer-button.confirmer-btn2 button",".confirmer");
				if ($confirmMessageClose.length){
					$confirmMessageClose.click();
				}
			}


			function isSettingPage() {
				var $settingPage = $("#settings-page");
				return $settingPage.length;
			}
			function closeSettingPage() {
				var $settingPageClose = $(".settings-header button","#settings-page");
				if ($settingPageClose.length){
					$settingPageClose.click();
				}
			}

			function isContextMenuOpen() {
				var $contextMenu = $(".extra-action");
				return $contextMenu.length;
			}

			function closeContextMenu() {
				var $contextMenuShield = $(".global-shield.extra-actions");
				if ($contextMenuShield.length){
					$contextMenuShield.click();
				}
			}

			function isSideMenuOpen() {
				var $sideMenu = $("#side-menu");
				return $sideMenu.hasClass("active") && $sideMenu.hasClass("sidemenu-opened");
			}

			function closeSideMenu() {
				var $sideMenu = $("#side-menu"),
				    sideMenuView = $sideMenu.data("pageView");
				sideMenuView && sideMenuView.toggleMenu();
			}

			function closePopupDialog() {
				var $popover = $(".popover-dropdown.active, .modal-dropdown.active"),
				    mcId = $popover.data("popover-mc") || $popover.data("modal-mc"),
				    pageView = $.capriza.activePage.data("pageView"),
				    popoverView = pageView.getView(mcId);

				popoverView.hideDropdown(true);
			}

			function clickOnCancelFeedback(){
				Dispatcher.trigger('feedback/close');
			}

			function unblockUI(){
				Dispatcher.trigger('unblockUI');
			}

			function isExistSingleActivePage(){

				// taken from SpecHelper
				var activePage = $(".page.active:not(#feedback-page)");
				return activePage.length === 1 && !(activePage.hasClass("in") || activePage.hasClass("out") || activePage.hasClass("pre"))
			}

			function isLoadingMessageAppears(){
				return !$('.loading-message').hasClass('hidden');
			}

			function isSplashScreen(){
				return $("#new-splash").length > 0;
			}

			function isPasscodeActive(){
				return $("#passcode-page").hasClass('active');
			}

			var lastWarnDate;
			var hasWarned = false;
			function warnAboutExit(){
				hasWarned = true;
				lastWarnDate = new Date();
				Dispatcher.trigger('dialog/show', {
					//msg: 'Press again to exit',
					msg: Capriza.translator.getText(Capriza.translator.ids.pressAgain),
					refreshButton: false
				});

				setTimeout(function(){
					hasWarned = false;
					Dispatcher.trigger('dialog/hide');
				}, 1250);
			}

			function hasWarnedAboutExit(){
				return hasWarned;
			}

			/**
			 * pop state is triggered by the browser's back button or Android's back button
			 */
			function onNativeBackButtonClicked(e) {

				Logger.debug('onNativeBackButtonClicked with '+ e.type);

				var $mcBackButton = $('.active .back-button').find('button');
				if (!Capriza.isPhonegap) addHistory();

				if (isPasscodeActive()) {
					Logger.debug('BB - Passcode in open. User has to fill the passcode.');
				}
				//else if(!Capriza.canUnblockUI()){
				//    Logger.debug('BB - ignored, the UI cannot be unblocked');
				//}
				else if(isFeedbackPageInTransit()){
					Logger.debug('BB - ignored, feedback in transition');
				}
				else if (isSplashScreen()){
					Logger.debug('BB - ignored, splash screen is on');
				}
				else if (isConfirmMessage()){
					Logger.debug('BB - confirmation message is displayed, click on cancel');
					closeConfirmMessage();
				}
				else if (isSettingPage()){
					Logger.debug('BB - setting page is open, click on done');
					closeSettingPage();
				}
				else if(isContextMenuOpen()){
					Logger.debug('BB - ui is blocked - unblock it (popup context menu is open)');
					closeContextMenu();
				}
				else if(isUIBlocked()){
					Logger.debug('BB - ui is blocked - unblock it (settings or notification menu is open, close them)');
					unblockUI();
				}
				else if(isSideMenuOpen()){
					Logger.debug('BB - Side menu is open, close it');
					closeSideMenu();
				}
				else if(isFeedbackPage()){
					Logger.debug('BB - current page is feedback, click the cancel button to return');
					clickOnCancelFeedback();
				}
				else if (!isExistSingleActivePage()){
					Logger.debug('BB - ignored,  the number of active pages doesnt equal to one');
				}
				else if(isLoadingMessageAppears()){
					if (hasWarnedAboutExit()) {
						Logger.debug('BB - exit app.');
						exit();
					} else {
						Logger.debug('BB - ignored, loading message appears');
					}
				}
				else if(isMobiscrollDialogOpen()){
					Logger.debug('BB - mobiscroll dialog is open, closing it');
					closeMobiscrollDialog();
				}
				else if(isDropdownPopoverOpen()){
					Logger.debug('BB - Dropdown Popup is open, clicking on shield to close popup');
					closePopupDialog();
				}
				else if(isBubbleOpen()){
					Logger.debug('BB - bubble is open, closing it');
					Dispatcher.trigger('bubbles/hide')
				}
				else if (isBackButtonVisible()){
					Logger.debug('BB - regular back button is visible, using its functionality');
					clickOnBackButton();
				}
				else if (isDialogPage()){
					Logger.debug('BB - Current page is dialog, clicking on cancel button');
					clickOnDialogCancelButton();
				}
				else if(isCnfPage()){
					Logger.debug('BB - Current page is CNF, clicking on back button');
					clickOnCNFBackButton();
				}
				else if($mcBackButton.length > 0){
					$mcBackButton.click();
				}
				else {
					Logger.debug('BB - show warning before closing zapp');
					warnAboutExit();
				}
			}

			// The idea is to add stack entry when the page contains custom back button, and to remove it if it doesn't
			if (Capriza.isPhonegap || Capriza.cordova){
				document.addEventListener("backbutton", onNativeBackButtonClicked, false);
			} else {
				window.addEventListener("popstate", onNativeBackButtonClicked);
			}

			Dispatcher.on("app/beforeClose", function(){
				if (Capriza.isPhonegap || Capriza.cordova) {

					// In case that event listener had been removed before the store was loaded,
					// the BB will be "free" and the user will be able to mess around with the stack
					setTimeout(function(){
						document.removeEventListener("backbutton", onNativeBackButtonClicked);
					}, 5000);
				}
			});

			addHistory();
		}

		init();
	}());

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};