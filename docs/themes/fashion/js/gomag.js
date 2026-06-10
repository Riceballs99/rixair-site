(function($){
	var dataAppend = [];
	var dataPrepend = [];
	var dataInside = [];
	var dataRun = [];
	var dataProductAjax = [];
	var config = [];
	var tmToStartCalc = '';
	var cookiePolicyCookieName = 'g_c_consent';




	var settings = {'doNotSelectVersion':false,'displayCategoryIconInMenu':false,'asyncClick':false,'ajaxCheckoutCheck':false, 'saveOrderUsingAjax':false, 'displayPRPAsBasePrice':false, 'discountDisplayType':'percent','countdownTimeUnit': {'timeUnitDays' : 'd','timeUnitHours' : 'h','timeUnitMinutes' : 'm','timeUnitSeconds' : 's','addToCartPopupDisplayTime' : 5}};
	function asyncClickTrigger()
	{
		var url = '';
		var queueList = [];
		var data = '';
		this.setUrl = function(url)
		{
			this.url = url;
		},
		this.getUrl = function()
		{
			return this.url;
		},
		this.setData = function(data)
		{
			this.data = data;
		},
		this.setQueueList = function(queueList)
		{
			this.queueList = queueList;
		},
		this.setCompleteOne = function()
		{
			var queueList = this.queueList;

			var complete = false
			if(queueList.length)
			{
				$.each(queueList, function(i,v){
					if(v == 1 && !complete)
					{
						queueList[i] = 0;
						this.queueList = queueList;
						complete = true;
					}
				})
			}

		},
		this.setBlockOne = function()
		{
			var queueList = this.queueList;
			var blocked = false;

			if(queueList.length)
			{
				$.each(queueList, function(i,v){
					if(v == 0 && !blocked)
					{
						queueList[i] = 1;
						this.queueList = queueList;
						blocked = true;
					}
				})
			}

		},
		this.allEventsDone = function()
		{
			var allDone = true;
			var queueList = this.queueList;
			if(!queueList.length)
			{
				return allDone;
			}
			$.each(queueList, function(i, v)
			{
				if(v != 0)
				{
					allDone = false;
				}
			}
			);
			return allDone;
		}
	}
	var theme = {};
	var envData = {};
	var productsList = {};
	var rulesCountDownTimers = false;
	var rulesCountDownTimersWasSet = false;
	var addToCartUrl = '';

	var widgets = {};
	var widgetUrl = '';

	var ajaxLoadUserDataUrl = '';
	var ajaxLoadUserProductsUrl = '';
	var ajaxLoadProductDetails = '';
	var ajaxComponentsReload = '';
	var productDetailsId = '';
	var languages = false;
	var currencies = false;

	var cartSummaryUrl = '';
	var orderSummaryUrl = '';
	var orderCkeckoutValidUrl = '';
	var orderCkeckoutSaveUrl = '';
	var orderCheckoutUrl = '';
	var orderUrl = '';
	var submitCheckoutForm = true;
	var productsStockDecimals = 2;
	var CID = '';
	var mainDomain = '';
	var checkPhoneNumberUrl = '';
	var lastSummaryDataRequest = '';
	var voucherFieldDisplayOption = '';
	var loggedInCustomer = '';

	function LoggedInCustomer() {
		this.lastname = '';
		this.firstname = '';
		this.email = '';
		this.phone = '';
		this.groupname = '';

		this.create = function(customer) {
			this.lastname = customer && customer.lastname ? customer.lastname : '';
			this.firstname = customer && customer.firstname ? customer.firstname : '';
			this.email = customer && customer.email ? customer.email : '';
			this.phone = customer && customer.phone ? customer.phone : '';
			this.groupname = customer && customer.groupname ? customer.groupname : '';
		}

		this.getLastname = function() {
			return this.lastname;
		}

		this.getFirstname = function() {
			return this.firstname;
		}

		this.getEmail = function() {
			return this.email;
		}

		this.getPhone = function() {
			return this.phone;
		}

		this.getGroupname = function() {
			return this.groupname;
		}
	};

	function AddToCartPopup(){
		var template = '';
		var simpleTemplate = '';
		var recommendedProductsTemplate = '';
		var popupDisplayTime = 5;
		var simpleTemplateLimitReached = false;
		var simpleTemplateProductOutOfStock = false;
		var recommendedProducts = false;
		var ignorePopup = false;
		var blocking = false;
		var defaultBlocking = false;
		var t1 = false;
		var t2 = false;
		var t3 = false;
		this.create = function(popup)
		{
			if(popup === false)
			{
				return false;
			}
			popup = JSON.parse(popup);


			this.simpleTemplate = popup.simpleTemplate ? popup.simpleTemplate : popup.template;
			this.simpleTemplateLimitReached = popup.simpleTemplateLimitReached ? popup.simpleTemplateLimitReached : false;
			this.simpleTemplateProductOutOfStock = popup.simpleTemplateProductOutOfStock ? popup.simpleTemplateProductOutOfStock : false;
			this.recommendedProductsTemplate = popup.emptyCustom ? popup.emptyCustom : popup.template;
			this.template = popup.template;
			this.blocking = popup.blocking;
			this.defaultBlocking = popup.blocking;
		}

		this.setBlocking = function(value)
		{
			this.blocking = value;
		}
		this.setRecommendedProducts = function(value)
		{
			this.recommendedProducts = value;
		}
		this.setIgnorePopup = function(value)
		{
			this.ignorePopup = value;
		}
		this.setDefaultTemplate = function(template)
		{
			this.template = template;
		}
		this.updatePopupDisplayTime = function(value)
		{
			this.popupDisplayTime = value;
		}
		this.clearTimeouts = function()
		{
			clearTimeout(this.t1);
			clearTimeout(this.t2);
			clearTimeout(this.t3);
		}
		this.displayLimitReached = function(product)
		{
			if(this.simpleTemplateLimitReached)
			{
				if(!$('.-g-addtocart-popup-custom').length){
					var templateToDisplay = this.simpleTemplateLimitReached;
					if($('#-g-addtocart-popup-default-limit-reached').length)
					{
						$('#-g-addtocart-popup-default-limit-reached').remove();
					}
					this.clearTimeouts();
					$('body').append(templateToDisplay);

					this.t1 = setTimeout(function(){
						$('.add2cart-pp').addClass('visible');
					},300);
					this.t2 = setTimeout(function(){
						$('.add2cart-pp').removeClass('visible');
					},15000);
					this.t3 = setTimeout(function(){
						$('#-g-addtocart-popup-default-limit-reached').remove();
					},16000);

				}
			}
		},
		this.displayProductOutOfStock = function(product, errorMessage)
		{
			if(this.simpleTemplateProductOutOfStock)
			{
				if(!$('.-g-addtocart-popup-custom').length){
					var templateToDisplay = this.simpleTemplateProductOutOfStock;
					if($('#-g-addtocart-popup-default-product-out-of-stock').length)
					{
						$('#-g-addtocart-popup-default-product-out-of-stock').remove();
					}
					this.clearTimeouts();
					$('body').append(templateToDisplay);
					if(product && errorMessage && $('#-g-addtocart-popup-default-product-out-of-stock .pop-r-txt').length){
						$('#-g-addtocart-popup-default-product-out-of-stock .pop-r-txt').after('<p class="pop-r-txt" style="color: #fff;"> '+errorMessage+'</p>');
					}
					this.t1 = setTimeout(function(){
						$('.add2cart-pp').addClass('visible');
					},300);
					this.t2 = setTimeout(function(){
						$('.add2cart-pp').removeClass('visible');
						$('#-g-addtocart-popup-default-product-out-of-stock').remove();
						$.Gomag.addToCartPopup.setIgnorePopup(false);
					},10000);
				}
			}
		},

		this.display = function(response, data)
		{
			if(this.ignorePopup)
			{
				return false;
			}
			var productImage = false;

			if(data.product.name != undefined)
			{
				var productName = data.product.name;

				if(data.product.hasImage){
					var image = data.product.image;
					productImage = image.replace('/original/', '/medium/');

				}
			}
			else if($('#bundleName_'+data.product.id).length)
			{
				var productName = $('#bundleName_'+data.product.id).val();
			}
			else
			{
				var productName = '';
			}
			productName = productName.replaceAll('\\\'', '&#39;');
			if($('#-g-addtocart-popup-default-product-out-of-stock').length)
			{
				$('#-g-addtocart-popup-default-product-out-of-stock').remove();
			}
			if($('#-g-addtocart-popup-default-limit-reached').length)
			{
				$('.-g-addtocart-popup-default-limit-reached').remove();
			}
			if(this.blocking)
			{
				if(!$('.-g-addtocart-popup-custom').length){
					var templateToDisplay = this.recommendedProducts ? this.recommendedProducts : this.template;

					templateToDisplay = templateToDisplay.replace(/\{\{productName\}\}/gi, productName);

					var options = {
						//width: 100,
						//height: '580px',

						toolbar : false,
						padding: '0',
						modal: false,
						type: 'inline',
						src : templateToDisplay
					};
					this.clearTimeouts();
					$.Gomag.openPopup(options);
					$.Gomag.eqProductRow();
				}
			}
			else
			{
				var templateToDisplay = this.template;

				templateToDisplay = templateToDisplay.replace(/\{\{productName\}\}/gi, productName);
				if(productImage)
				{
					templateToDisplay = templateToDisplay.replace(/<i class="fa fa-shopping-bag -g-shopping-bag" aria-hidden="true"><\/i>/gi, '<div class="add2cart-image" id="addedProductImage"><img src="'+productImage+'" style="max-height: 40px; max-width: 40px;"></div>');
				}
				if($('#-g-addtocart-popup-default').length)
				{
					$('#-g-addtocart-popup-default').remove();
				}
				this.clearTimeouts();
				$('body').append(templateToDisplay);

				var productName = productName.replace(/&#39;/g, "'").replace(/\\/g, '');
				$('#addedProduct').html(productName);

				this.t1 = setTimeout(function(){
					$('.add2cart-pp').addClass('visible');
				},300);
				if(this.popupDisplayTime > 0)
				{
					this.t2 = setTimeout(function(){
						$('.add2cart-pp').removeClass('visible');
					},(this.popupDisplayTime * 1000));
					this.t3 = setTimeout(function(){
						$('#-g-addtocart-popup-default').remove();
					},(this.popupDisplayTime * 1000) + 1000);
				}
			}
		}
	};


	var environment = [];
	var defaultCookieTime = 5*3600*24*1000;
	var defaultCookieTimeOneDay = 3600*24*1000;
	var queryStringCookies = {
		_g_b_id: '_g_b_id'
	};

	var secureFormsValues = {
		'isSecure' : false
	};

	var events = {};
	function eventResponse(){
					var results = [];
					var last = '';
					this.getOk = function()
					{
						return results;
					};
					this.delay = function()
					{
						var index = results.length - 1;
						results[index] = 0;
						return index;
					}
					this.complete = function(i)
					{

						var index = i !== undefined ? i : results.length;

						results[index] = 1;
						return index;
					};
					this.checkComplete = function()
					{
						return results.indexOf(0);
					}

	};
	function cartItem()
	{
		this.product = '';
		this.quantity = '';
		this.parent = '';
		this.rule = '';
		this.configurations = '';
		this.extraData = '';
		this.userPopUpConfigurations = false;
		this.oneTimeOffer = true;
	}
	function cartCollection()
	{
		var items = [];
		var main = '';
		var addToCartOk = true;
		var location = 'd';
		this.setMainElement = function(item)
		{
			if(item instanceof cartItem){
				main = item;
			}
		};
		this.setAddToCartOk = function(value)
		{
			addToCartOk = value;
		};
		this.getAddToCartOk = function()
		{
			return addToCartOk;
		};
		this.setLocation = function(value)
		{
			location = value;
		};
		this.getLocation = function()
		{
			return location;
		};
		this.replaceMainElement = function(item)
		{
			if(item instanceof cartItem){
				main = item;
			}
		};
		this.getMain = function()
		{
			return main;
		};
		this.getItems = function()
		{
			return items;
		};
		this.setItem = function(item)
		{
			if(item instanceof cartItem){
				items.push(item);
			}
		};

		this.prepareForCart = function(){

			var r = 0;
			var p = [];
			var parent = [];
			var q = [];
			var c = '';
			var d = '';
			if(this.getMain()){
				p.push(this.getMain().product);
				parent.push(this.getMain().parent);
				q.push(this.getMain().quantity);
				c = this.getMain().configurations;
				d = this.getMain().extraData;
			}
			if(items.length)
			{
				$.each(items, function(i, v){

					p.push(v.product);
					parent.push(v.parent);
					q.push(v.quantity);
					r = v.rule;
					d = v.extraData;
				})
			}
			var cart = {
				'product': p,
				'quantity': q,
				'parent': parent,
				'rule': r,
				'product_configurations': c,
				'sugested_payment': JSON.stringify(d)
			};

			return cart;
		};
	};

	function gomagOrderSummary()
	{
		this.shipping_country = '';
		this.shipping_region = '';
		this.shipping_city = '';
		this.shipping_method = '';
		this.shipping_zipcode = '';
		this.region_name = '';
		this.city_name = '';
		this.updateType = 'shippingCountry';
		this.target = 'order';
		this.cartUpdate = '';
		this.cart = '';
		this.payment = '';
		this.voucher = '';
		this.customerPoints = '';
		this.orderSummaryUrl = '';
		this.cartDiscounts = '';
		this.cartSubtotal = '';
		this.cartSubtotalNoFilter = '';
		this.cartTotalNoFilter = '';
		this.cartSummary = '';
		this.cartSummaryHtml = '';
		this.cartTotal = '';
		this.weightTotal = '';
		this.cartVoucherError = '';
		this.cityId = '';
		this.cityName = '';
		this.countryId = '';
		this.countryName = '';
		this.currency = '';
		this.disableSubmitButton = '';
		this.displayMinimumOrderText = '';
		this.payments = '';
		this.paymentsToDisplay = '';
		this.selectedPaymentIsMissing = '';
		this.regionId = '';
		this.regionName = '';
		this.selectedShipping = '';
		this.shippingMethods = '';
		this.shippingMethodsIncompleteSelection = '';
		this.shippingTotal = '';
		this.shipping_name = '';
		this.shippings = '';
		this.cartOneTimeOffers = '';
		this.addressIsNotRequired = '';
		this.lockerId = '';
		this.lockerSupportedPaymentType = '';
		this.zipCodes = '';
		this.cartItemsCount = '';
		this.cartItemsRemoved = '';
		this.selectedPayment = '';
		this.billingType = '';
		this.customData = '';
		this.doesntRequiresShipping = '';
		this.reloadCartSummary = '';

		this.initProperties = ['shipping_country', 'shipping_region', 'shipping_city', 'shipping_method', 'shipping_zipcode', 'region_name', 'city_name', 'updateType', 'updateType', 'payment', 'voucher', 'target', 'customerPoints', 'orderSummaryUrl', 'cartUpdate', 'cart', 'lockerId', 'lockerSupportedPaymentType', 'billingType'];

		this.setData = function(data, dataType)
		{
			var $this = this;
			if(data != undefined && data) {
				$.each(data, function(i, v){

					if(dataType == 'init' && jQuery.inArray(i, $this.initProperties) === -1)
					{
						return true;
					}

					if(dataType == 'complete' && jQuery.inArray(i, $this.initProperties) !== -1)
					{
						return true;
					}

					if($this[i] !== undefined)
					{
						$this[i] = v;
					}

				});
			}

		};
		this.getPropertiesForInit = function()
		{
			var obj = this;
			var properties = {}
			$.each(obj, function(i, v){
				if(typeof v === 'function' || jQuery.inArray(i, obj.initProperties) === -1 || (v == '' && i != 'voucher'))
				{
					return true;
				}
				properties[i] = v;
			});
			return properties;

		}
		this.getProperties = function()
		{
			var obj = this;
			var properties = {}
			$.each(obj, function(i, v){
				if(typeof v === 'function')
				{
					return true;
				}
				properties[i] = v;
			})
			return properties;
		};

	}

	var orderSummary = new gomagOrderSummary;

	var loadedScripts = {};
	$.Gomag = {
		loadScript: function(url, doneCallback, failCallback)
		{
			if(loadedScripts[url] == undefined)
			{

				$.getScript(url)
				.done(function(script, textStatus){
					if(doneCallback != undefined)
					{
						doneCallback();
					}
				})
				.fail(function(script, textStatus){
					if(failCallback != undefined)
					{
						failCallback();
					}
				})

				loadedScripts[url] = url;
			}
			else
			{
				if(doneCallback != undefined)
					{
						doneCallback();
					}
			}
		},
		getData: function(){
			//console.log(data);
		},
		parseNumber : function(type, number)
		{

			return type == 'float' ? parseFloat(number) : parseInt(number);

		},
		bind : function(event, callback, key)
		{
			events[event] = events[event] !== undefined ? events[event] : {};
			if(callback.name)
			{
				var callbackName = callback.name;
			}else if(key != undefined && key != '')
			{
				var callbackName = key;
			} else {
				var callbackName = Object.keys(events[event]).length + 1;
			}

			events[event][callbackName] = callback;
		},
		trigger : function(event, data, callbackEvent, key)
		{
			if(events[event] !== undefined)
			{

				var eventResponseTrigger = new eventResponse;
				$.each(events[event], function(i, callback){
					if((key != undefined && i == key) || key == undefined || (key != undefined && !key))
					{
						eventResponseTrigger.complete();
						callback(eventResponseTrigger, data);
					}
				});
				var eventResponseCheck = setInterval(function(){
					if(eventResponseTrigger.checkComplete() === -1)
					{

						clearInterval(eventResponseCheck);
						clearTimeout(eventResponseCheck);
						if(callbackEvent !== undefined && false !== callbackEvent){
							callbackEvent();
						}

					}

				}, 300);

			}
			else
			{
				if(callbackEvent !== undefined && false !== callbackEvent){
					callbackEvent();
				}
			}
		},
		triggerAsync : function(event, data, queue)
		{

			if(events[event] !== undefined)
			{

				queueList = [];

				$.each(events[event], function(i, callback){
					queueList.push(0);
				});
				queue.setQueueList(queueList);

				$.each(events[event], function(i, callback){

					callback(queue);

				});
			}
		},

		append : function(dataBlock, value, lazyload){

			if(lazyload !== undefined && lazyload){
				dataAppend.push({'dataBlock': dataBlock, 'value': value});
			} else {
				$('[data-block="'+dataBlock+'"]').each(function(){
					if(!$(this).siblings('[data-block="'+dataBlock+'After"]').length){

						$(this).after('<div data-block="'+dataBlock+'After"></div>');
					}
				})
				$('[data-block="'+dataBlock+'After"]').append(
					function(){
						return typeof value === 'function'
							?
							value($(this), JSON.parse($(this).parents('[data-Gomag]').attr('data-Gomag')))
							:
							value}

				).attr('data-block-loaded', 'loaded');
			}
		},
		inside : function(dataBlock, value, lazyload){

			if(lazyload !== undefined &&  lazyload){
				dataInside.push({'dataBlock': dataBlock, 'value': value});
			} else {
				$('[data-block="'+dataBlock+'"]').each(function(){
					if(!$(this).find('[data-block="'+dataBlock+'Inside"]').length){

						$(this).append('<div data-block="'+dataBlock+'Inside"></div>');
					}
				})

				$('[data-block="'+dataBlock+'Inside"]').append(
					function(){
						return typeof value === 'function'
							?
							value($(this), JSON.parse($(this).parents('[data-Gomag]').attr('data-Gomag')))
							:
							value}

				).attr('data-block-loaded', 'loaded');

			}

		},

		prepend : function(dataBlock, value, lazyload){
			if(lazyload !== undefined && lazyload){

				dataPrepend.push({'dataBlock': dataBlock, 'value': value});
			} else {
				$('[data-block="'+dataBlock+'"]').each(function(){
					if(!$(this).siblings('[data-block="'+dataBlock+'Before"]').length){

						$(this).before('<div data-block="'+dataBlock+'Before"></div>');
					}
				})
				$('[data-block="'+dataBlock+'Before"]').append(
					function(){
						return typeof value === 'function'
							?
							value($(this), JSON.parse($(this).parents('[data-Gomag]').attr('data-Gomag')))
							:
							value}

				).attr('data-block-loaded', 'loaded');
			}

		},

		run : function(dataFunction){

			dataRun.push(dataFunction);

		},
		buildProductsForDataRequest : function(products)
		{
			var uniqueProducts = {};
			if(products != undefined && typeof products == 'object' && !jQuery.isEmptyObject(products)) {
				uniqueProducts = products;
			} else {
				$.Gomag.productDetailsId = '';
				$($.Gomag.config.listingProductBox).each(function() {
					if(!$(this).hasClass($.Gomag.config.listingProductBoxAjaxComplete)) {
						var classList = $(this).attr('class').match($.Gomag.config.listingProductBoxClassNamePrefix+'([0-9]+)');
						if(classList !== null) {
							uniqueProducts[classList[1]] = classList[1];
						}
					}
				});

				$($.Gomag.config.detailsProductBox).each(function() {
					var classList = $(this).attr('class').match($.Gomag.config.detailsProductBoxClassNamePrefix+'([0-9]+)');

					if(classList !== null) {
						uniqueProducts[classList[1]] = classList[1];
						$.Gomag.productDetailsId = classList[1];
					}
				});

				$($.Gomag.config.detailsProductVersionsBox).each(function() {
					var classList = $(this).attr('class').match($.Gomag.config.detailsProductVersionsBoxClassNamePrefix+'([0-9]+)');

					if(classList !== null) {
						uniqueProducts[classList[1]] = classList[1];
					}
				});
			}

			var products = [];
			if(!jQuery.isEmptyObject(uniqueProducts)) {
				$.each(uniqueProducts, function(i, v) {
					products.push(v);
				});
			}

			$.Gomag.getUserAjaxData(products.sort());
			$.Gomag.getProductsAjaxData(products.sort());
		},
		MD5 :function(string){
			 function RotateLeft(d,n){return d<<n|d>>>32-n}function AddUnsigned(d,n){var a,c,S,r,x;return S=2147483648&d,r=2147483648&n,x=(1073741823&d)+(1073741823&n),(a=1073741824&d)&(c=1073741824&n)?2147483648^x^S^r:a|c?1073741824&x?3221225472^x^S^r:1073741824^x^S^r:x^S^r}function F(d,n,a){return d&n|~d&a}function G(d,n,a){return d&a|n&~a}function H(d,n,a){return d^n^a}function I(d,n,a){return n^(d|~a)}function FF(d,n,a,c,S,r,x){return AddUnsigned(RotateLeft(d=AddUnsigned(d,AddUnsigned(AddUnsigned(F(n,a,c),S),x)),r),n)}function GG(d,n,a,c,S,r,x){return AddUnsigned(RotateLeft(d=AddUnsigned(d,AddUnsigned(AddUnsigned(G(n,a,c),S),x)),r),n)}function HH(d,n,a,c,S,r,x){return AddUnsigned(RotateLeft(d=AddUnsigned(d,AddUnsigned(AddUnsigned(H(n,a,c),S),x)),r),n)}function II(d,n,a,c,S,r,x){return AddUnsigned(RotateLeft(d=AddUnsigned(d,AddUnsigned(AddUnsigned(I(n,a,c),S),x)),r),n)}function ConvertToWordArray(d){for(var n,a=d.length,c=a+8,S=16*((c-c%64)/64+1),r=Array(S-1),x=0,b=0;b<a;)x=b%4*8,r[n=(b-b%4)/4]=r[n]|d.charCodeAt(b)<<x,b++;return x=b%4*8,r[n=(b-b%4)/4]=r[n]|128<<x,r[S-2]=a<<3,r[S-1]=a>>>29,r}function WordToHex(d){var n,a="",c="";for(n=0;n<=3;n++)a+=(c="0"+(d>>>8*n&255).toString(16)).substr(c.length-2,2);return a}function Utf8Encode(d){d=d.replace(/\r\n/g,"\n");for(var n="",a=0;a<d.length;a++){var c=d.charCodeAt(a);c<128?n+=String.fromCharCode(c):(127<c&&c<2048?n+=String.fromCharCode(c>>6|192):(n+=String.fromCharCode(c>>12|224),n+=String.fromCharCode(c>>6&63|128)),n+=String.fromCharCode(63&c|128))}return n}var k,AA,BB,CC,DD,a,b,c,d,x=Array(),S11=7,S12=12,S13=17,S14=22,S21=5,S22=9,S23=14,S24=20,S31=4,S32=11,S33=16,S34=23,S41=6,S42=10,S43=15,S44=21;for(string=Utf8Encode(string),x=ConvertToWordArray(string),a=1732584193,b=4023233417,c=2562383102,d=271733878,k=0;k<x.length;k+=16)b=II(b=II(b=II(b=II(b=HH(b=HH(b=HH(b=HH(b=GG(b=GG(b=GG(b=GG(b=FF(b=FF(b=FF(b=FF(BB=b,c=FF(CC=c,d=FF(DD=d,a=FF(AA=a,b,c,d,x[k+0],S11,3614090360),b,c,x[k+1],S12,3905402710),a,b,x[k+2],S13,606105819),d,a,x[k+3],S14,3250441966),c=FF(c,d=FF(d,a=FF(a,b,c,d,x[k+4],S11,4118548399),b,c,x[k+5],S12,1200080426),a,b,x[k+6],S13,2821735955),d,a,x[k+7],S14,4249261313),c=FF(c,d=FF(d,a=FF(a,b,c,d,x[k+8],S11,1770035416),b,c,x[k+9],S12,2336552879),a,b,x[k+10],S13,4294925233),d,a,x[k+11],S14,2304563134),c=FF(c,d=FF(d,a=FF(a,b,c,d,x[k+12],S11,1804603682),b,c,x[k+13],S12,4254626195),a,b,x[k+14],S13,2792965006),d,a,x[k+15],S14,1236535329),c=GG(c,d=GG(d,a=GG(a,b,c,d,x[k+1],S21,4129170786),b,c,x[k+6],S22,3225465664),a,b,x[k+11],S23,643717713),d,a,x[k+0],S24,3921069994),c=GG(c,d=GG(d,a=GG(a,b,c,d,x[k+5],S21,3593408605),b,c,x[k+10],S22,38016083),a,b,x[k+15],S23,3634488961),d,a,x[k+4],S24,3889429448),c=GG(c,d=GG(d,a=GG(a,b,c,d,x[k+9],S21,568446438),b,c,x[k+14],S22,3275163606),a,b,x[k+3],S23,4107603335),d,a,x[k+8],S24,1163531501),c=GG(c,d=GG(d,a=GG(a,b,c,d,x[k+13],S21,2850285829),b,c,x[k+2],S22,4243563512),a,b,x[k+7],S23,1735328473),d,a,x[k+12],S24,2368359562),c=HH(c,d=HH(d,a=HH(a,b,c,d,x[k+5],S31,4294588738),b,c,x[k+8],S32,2272392833),a,b,x[k+11],S33,1839030562),d,a,x[k+14],S34,4259657740),c=HH(c,d=HH(d,a=HH(a,b,c,d,x[k+1],S31,2763975236),b,c,x[k+4],S32,1272893353),a,b,x[k+7],S33,4139469664),d,a,x[k+10],S34,3200236656),c=HH(c,d=HH(d,a=HH(a,b,c,d,x[k+13],S31,681279174),b,c,x[k+0],S32,3936430074),a,b,x[k+3],S33,3572445317),d,a,x[k+6],S34,76029189),c=HH(c,d=HH(d,a=HH(a,b,c,d,x[k+9],S31,3654602809),b,c,x[k+12],S32,3873151461),a,b,x[k+15],S33,530742520),d,a,x[k+2],S34,3299628645),c=II(c,d=II(d,a=II(a,b,c,d,x[k+0],S41,4096336452),b,c,x[k+7],S42,1126891415),a,b,x[k+14],S43,2878612391),d,a,x[k+5],S44,4237533241),c=II(c,d=II(d,a=II(a,b,c,d,x[k+12],S41,1700485571),b,c,x[k+3],S42,2399980690),a,b,x[k+10],S43,4293915773),d,a,x[k+1],S44,2240044497),c=II(c,d=II(d,a=II(a,b,c,d,x[k+8],S41,1873313359),b,c,x[k+15],S42,4264355552),a,b,x[k+6],S43,2734768916),d,a,x[k+13],S44,1309151649),c=II(c,d=II(d,a=II(a,b,c,d,x[k+4],S41,4149444226),b,c,x[k+11],S42,3174756917),a,b,x[k+2],S43,718787259),d,a,x[k+9],S44,3951481745),a=AddUnsigned(a,AA),b=AddUnsigned(b,BB),c=AddUnsigned(c,CC),d=AddUnsigned(d,DD);var temp=WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
			return temp.toLowerCase();
		},
		buildHash: function(data)
		{

			return $.Gomag.MD5(JSON.stringify(data));
		},
		addProductListing : function(i, v, currency) {
			var displayDiscountValue = v.forceDiscountDisplay != undefined && v.forceDiscountDisplay ? true : false;
			if($($.Gomag.config.listingFinalPrice + i).parents($.Gomag.config.componentsGeneralClass).length || $($.Gomag.config.listingFinalPrice + i).parents($.Gomag.config.detailsProductRowBoxHolder).length)
			{
				if(v.basePriceCurrency)
				{
					if(v.displayPRP)
					{

						if(parseFloat(v.prp_price) == 0)
						{
							$($.Gomag.config.listingPrpPrice + i).html(v.basePriceList);
							$($.Gomag.config.listingBasePrice + i).html('');
							v.priceVatBaseExcluded = '';
						}
						else
						{
							displayDiscountValue = true;
							$($.Gomag.config.listingPrpPrice + i).html(v.prpPriceCurrency);
							if(v.basePriceList != v.finalPriceList) {
								$($.Gomag.config.listingBasePrice + i).html(v.basePriceList);
							}
						}
					}
					else
					{
						if(v.basePriceList != v.finalPriceList) {
							$($.Gomag.config.listingBasePrice + i).html(v.basePriceList);
						}
						else
						{
							$($.Gomag.config.listingBasePrice + i).html('');
						}
						if(v.prpPriceCurrency)
						{
							displayDiscountValue = true;
							$($.Gomag.config.listingPrpPrice + i).html(v.prpPriceCurrency);
						}
					}

				}
				else
				{
					$($.Gomag.config.listingBasePrice + i).html('');
					v.priceVatBaseExcluded = '';
				}
				$($.Gomag.config.listingFinalPrice + i).html(v.finalPriceList);
				$($.Gomag.config.listingFinalPriceVat + i).html(v.priceVatFinalExcluded);
				$($.Gomag.config.listingBasePriceVat + i).html(v.priceVatBaseExcluded);
				$($.Gomag.config.detailsFinalPriceWithVat + i).html(v.finalPriceWithVatCurrency);

				if($($.Gomag.config.detailsBasePriceWithVat + i).length && v.basePriceWithVatCurrency != undefined) {
					$($.Gomag.config.listingBasePriceWithVat + i).html('');
					$($.Gomag.config.detailsBasePriceWithVat + i).html(v.basePriceWithVatCurrency);
				} else {
					$($.Gomag.config.listingBasePriceWithVat + i).html(v.basePriceWithVatCurrency);
				}
			}
			else
			{

				if(v.basePriceList)
				{

					if(v.displayPRP)
					{

						if(parseFloat(v.prp_price) == 0)
						{
							$($.Gomag.config.listingPrpPrice + i).html(v.basePriceList);
							$($.Gomag.config.listingBasePrice + i).html('');
							v.priceVatBaseExcluded = '';
						}
						else
						{
							displayDiscountValue = true;
							$($.Gomag.config.listingPrpPrice + i).html(v.prpPriceCurrency);
							if(v.basePriceList != v.finalPriceList) {
								$($.Gomag.config.listingBasePrice + i).html(v.basePriceList);
							}
							else
							{
								$($.Gomag.config.listingBasePrice + i).html('');
							}
						}
					}
					else
					{
						if(v.basePriceList != v.finalPriceList) {
							$($.Gomag.config.listingBasePrice + i).html(v.basePriceList);
						}
						else
						{
							$($.Gomag.config.listingBasePrice + i).html('');
						}
						if(v.prpPriceCurrency)
						{
							displayDiscountValue = true;
							$($.Gomag.config.listingPrpPrice + i).html(v.prpPriceCurrency);
						}
					}

				}
				else
				{
					$($.Gomag.config.listingBasePrice + i).html('');
					v.priceVatBaseExcluded = '';
					if(v.displayPRP && v.prpPriceCurrency)
					{
						displayDiscountValue = true;
						$($.Gomag.config.listingPrpPrice + i).html(v.prpPriceCurrency);
					}
				}

				$($.Gomag.config.listingFinalPrice + i).html(v.finalPriceList);
				$($.Gomag.config.listingFinalPriceVat + i).html(v.priceVatFinalExcluded);
				$($.Gomag.config.listingBasePriceVat + i).html(v.priceVatBaseExcluded);

				$($.Gomag.config.detailsFinalPriceWithVat + i).html(v.finalPriceWithVatCurrency);
			}

			if($($.Gomag.config.listingBasePrice + i).html() && v.priceVatBaseExcludedSpan != undefined && !$($.Gomag.config.listingBasePrice + i).find($.Gomag.config.listingBasePriceVat + i).length)
			{
				$($.Gomag.config.listingBasePrice + i).append(v.priceVatBaseExcludedSpan);
			}
			if($($.Gomag.config.detailsBasePriceWithVat + i).length && v.basePriceWithVatCurrency != undefined) {
				$($.Gomag.config.listingBasePriceWithVat + i).html('');
				$($.Gomag.config.detailsBasePriceWithVat + i).html(v.basePriceWithVatCurrency);
			} else {
				$($.Gomag.config.listingBasePriceWithVat + i).html(v.basePriceWithVatCurrency);
			}

			if(v.um != undefined && v.um != '')
			{
				$($.Gomag.config.listingUM + i).html(v.um).removeClass('hide');
			}

			if(v.finalUnitPrice != undefined && v.finalUnitPrice) {
				$($.Gomag.config.listingUnitPrice + i).html(v.finalUnitPrice);
			}

			if(v.finalUnitPrice != undefined && v.finalUnitPrice) {
				$($.Gomag.config.listingUnitPrice + i).html(v.finalUnitPrice);

				if(v.baseUnitPrice != undefined && v.baseUnitPrice > v.finalUnitPrice) {
					$($.Gomag.config.listingUnitBasePrice + i).html(v.baseUnitPrice);
				}
			}

			if(v.disableAddToCartButton === true)
			{
				$($.Gomag.config.listingAddToCartGeneral).trigger('hideAddToCartButton', (v));

			}
			if(v.basePrice == '' || parseFloat(parseFloat(v.basePrice).toFixed(2)) <= parseFloat(parseFloat(v.finalPrice).toFixed(2)) || (v.displayPRP && !displayDiscountValue))
			{
				$($.Gomag.config.listingDiscountIcon + i).remove();
			}
			else
			{
				$($.Gomag.config.listingIconBox + i).each(function(){
					if(!v.displayPRP || displayDiscountValue)
					{
						if($(this).find($.Gomag.config.listingDiscountIcon + i).length)
						{

							$(this).find($.Gomag.config.listingDiscountIcon + i).removeClass('hide');
							if($.Gomag.settings.discountDisplayType == 'value')
							{
								if (v.discountValue >= 1) {
									$(this).find($.Gomag.config.listingDiscountIcon + i).html('-'+v.discountValue+' '+currency).addClass('-g-icon-discount-value');
								}
							}
							else
							{
								if (v.discountPercent >= 1) {
									$(this).find($.Gomag.config.listingDiscountIcon + i).html('-'+v.discountPercent+'%');
								}
							}
						}
						else
						{

							if($.Gomag.settings.discountDisplayType == 'value'){
								if (v.discountValue >= 1) {
									$(this).prepend('<span class="icon discount bg-main '+($.Gomag.config.listingDiscountIconClass + i)+' -g-icon-discount-value">-'+v.discountValue+' '+ currency +'</span>');
								}
							}

							else
							{
								if (v.discountPercent >= 1) {
									$(this).prepend('<span class="icon discount bg-main '+($.Gomag.config.listingDiscountIconClass + i)+'">-'+v.discountPercent+'%</span>');
								}
							}
						}
					}
				})
			}
			$($.Gomag.config.listingProductPriceBox + i).removeClass('-g-hide');
			$('.'+$.Gomag.config.listingProductBoxClassNamePrefix + i).addClass($.Gomag.config.listingProductBoxAjaxComplete);

		},
		addProductDetail: function(i, v, currency) {
			var displayDiscountValue = false;
			if($.Gomag.productDetailsId == i) {
				if(v.disableAddToCartButton === true) {
					$($.Gomag.config.detailsAddToCart + i).trigger('hideAddToCartButton');
				} else {
					$($.Gomag.config.detailsAddToCart + i).trigger('displayAddToCartButton');
				}

				if(v.displayPRP) {
					if(parseFloat(v.prp_price) == 0) {
						displayDiscountValue = true;
						$($.Gomag.config.detailsPrpPrice + i).html(v.basePriceCurrency);
						$($.Gomag.config.detailsBasePrice + i).html('');
						v.priceVatBaseExcluded = '';
						$($.Gomag.config.detailsBasePrice + i).parent().css('display', 'inline');
						$($.Gomag.config.detailsBasePriceVat + i).css('display', '');
					}
					else
					{
						if($($.Gomag.config.detailsBasePrice + i).length == 0)
						{
							v.priceVatBaseExcluded = '';
							$($.Gomag.config.detailsBasePriceVat + i).css('display', '');
						}

						$($.Gomag.config.detailsPrpPrice + i).html(v.prpPriceCurrency);

						if(v.basePrice == '' || parseFloat(v.basePrice) > parseFloat(v.finalPrice))
						{
							displayDiscountValue = true;
							$($.Gomag.config.detailsBasePrice + i).html(v.basePriceCurrency);
						}
						else
						{
							$($.Gomag.config.detailsBasePrice + i).parent().css('display', 'inline');
						}

					}
						if(v.prpPriceInfoText)
						{
							$($.Gomag.config.detailsPrpPriceText + i).append(v.prpPriceInfoText);
						}
						if(parseFloat(v.basePrice) > parseFloat(v.finalPrice)){
							$($.Gomag.config.detailsPrpPriceText + i).parent().removeClass('hide');
						}
				}
				else
				{
					if(parseFloat(v.basePrice) > parseFloat(v.finalPrice))
					{
						if(!$('.-g-product-full-price-'+v.id).length)
						{
							if($('.-g-product-price-box-'+v.id+' .-g-base-price-info'))
							{
								$('.-g-product-price-box-'+v.id+' .-g-base-price-info').parent().append('<span class="bPrice -g-product-full-price-'+v.id+'">'+v.basePriceCurrency+'</span>')
							}
							else
							{
								$('.-g-product-final-price-'+v.id).before('<s><span class="bPrice -g-product-full-price-'+v.id+'">'+v.basePriceCurrency+'</span></s>')
							}
						}
						$($.Gomag.config.detailsBasePrice + i).html(v.basePriceCurrency);
					}
					else
					{
						$($.Gomag.config.detailsBasePrice + i).html('');
					}
					if(v.prpPriceCurrency)
					{
						$($.Gomag.config.detailsPrpPrice + i).html(v.prpPriceCurrency);
					}
				}

				$($.Gomag.config.detailsFinalPrice + i).html(v.finalPriceCurrency);
				$($.Gomag.config.detailsBasePriceVat + i).html(v.priceVatBaseExcluded);
				$($.Gomag.config.detailsFinalPriceVat + i).html(v.priceVatFinalExcluded);

				if($($.Gomag.config.detailsBasePriceWithVat + i).length && v.basePriceWithVatCurrency != undefined) {
					$($.Gomag.config.detailsBasePriceWithVat + i).html(v.basePriceWithVatCurrency);
				}

				if($($.Gomag.config.detailsFinalPriceWithVat + i).length && v.finalPriceWithVatCurrency != undefined) {
					$($.Gomag.config.detailsFinalPriceWithVat + i).html(v.finalPriceWithVatCurrency);
				}

				if(v.um != undefined && v.um != '') {
					$($.Gomag.config.detailsUM + i).html(v.um).removeClass('hide');
				}

				if(v.finalUnitPrice != undefined && v.finalUnitPrice) {
					$($.Gomag.config.detailsUnitPrice + i).html(v.finalUnitPrice);

					if(v.baseUnitPrice != undefined && v.baseUnitPrice > v.finalUnitPrice) {
						$($.Gomag.config.detailsUnitBasePrice + i).html(v.baseUnitPrice);
					}
				}

				$($.Gomag.config.detailsFinalPriceVat + i).html(v.priceVatFinalExcluded);

				if((v.basePrice == '' || parseFloat(v.basePrice) > parseFloat(v.finalPrice)) && (!v.displayPRP || displayDiscountValue))
				{
					$($.Gomag.config.detailsPriceInfo).html(v.priceInfoText);
					if(parseFloat(v.basePrice) > parseFloat(v.finalPrice))
					{
						$($.Gomag.config.detailsDiscountValue).html(parseFloat(v.basePrice) - parseFloat(v.finalPrice));
					}
					else
					{
						$($.Gomag.config.detailsDiscountValueHolder).remove();
					}
					if($($.Gomag.config.detailsIconBox + i).find($.Gomag.config.detailsDiscountIcon + i).length) {
						$($.Gomag.config.detailsIconBox + i).find($.Gomag.config.detailsDiscountIcon + i).removeClass('hide');
						if($.Gomag.settings.discountDisplayType == 'value') {
							if (v.discountValue >= 1) {
								$($.Gomag.config.detailsIconBox + i).find($.Gomag.config.detailsDiscountIcon + i).html('-'+v.discountValue+' '+currency).addClass('-g-icon-discount-value');
								$($.Gomag.config.detailsIconBox + i).find($.Gomag.config.detailsDiscountIcon + i).addClass('-g-icon-discount-value');
							}
						} else {
							if (v.discountPercent >= 1) {
								$($.Gomag.config.detailsIconBox + i).find($.Gomag.config.detailsDiscountIcon + i).html('-'+v.discountPercent+'%');
							}
						}
					} else {

						if($.Gomag.settings.discountDisplayType == 'value') {
							if (v.discountValue >= 1) {
								$($.Gomag.config.detailsIconBox + i).append('<span class="icon discount bg-main '+($.Gomag.config.detailsDiscountIconClass + i)+' -g-icon-discount-value">-'+v.discountValue+' '+ currency +'</span>');
							}
						} else {
							if (v.discountPercent >= 1) {
								$($.Gomag.config.detailsIconBox + i).append('<span class="icon discount bg-main '+($.Gomag.config.detailsDiscountIconClass + i)+'">-'+v.discountPercent+'%</span>');
							}
						}
					}
				} else {
					$($.Gomag.config.detailsPriceInfo).html(v.priceInfoText);
					$($.Gomag.config.detailsDiscountValue).remove();
					$($.Gomag.config.detailsDiscountValueHolder).remove();
				}

				if(!v.displayPRP) {
					$($.Gomag.config.detailsPriceInfoIcon).addClass('hide');
				}


				$($.Gomag.config.detailsProductPriceBox + i).removeClass('hide -g-hide');
				$.event.trigger('Gomag/Product/Detail/Loaded', {v:v});
				$.Gomag.trigger('Gomag/Product/Detail/Loaded', {v:v});
				$.Gomag.setRuleCountdown(v);
			}
		},
		getProductParentFromEav: function(productId)
		{
			if(productId == undefined || !productId)
			{
				return false;
			}
			var parent = false;
			if(productId)
			{
				var products = $.Gomag.getEnvData() != undefined ? $.Gomag.getEnvData() : false;

				if(products && products.products[productId] != undefined && products.products[productId] != undefined)
				{
					parent = products.products[productId].parent;
				}
			}
			return parent;
		},
		getEnvironmentData: function(encoded)
		{
			if(encoded != undefined && encoded === true)
			{
				return JSON.stringify($.Gomag.environment);
			}
			else
			{
				return $.Gomag.environment;
			}
		},
		getUserAjaxData: function(products)
		{
			var productDetailsId = $.Gomag.productDetailsId ? $.Gomag.productDetailsId : 0;
			var hash = '';
			if(products != undefined && products.length)
			{
				hash = $.Gomag.buildHash({p:products, v: $.Gomag.productDetailsId});
			}
			let url = $.Gomag.settings && $.Gomag.settings.ignoreAjaxCachereBuild != undefined && $.Gomag.settings.ignoreAjaxCachereBuild ? '' : window.location.href;
			$.get($.Gomag.ajaxLoadUserDataUrl, {parent: $.Gomag.getProductParentFromEav($.Gomag.productDetailsId), productDetailsId: productDetailsId, url: url, hash: hash, cu: $.Gomag.getCookie('selectedCurrency'), env: $.Gomag.getEnvironmentData(true)}, function(data){

				$.Gomag.addCartVoucher();

				$.Gomag.trigger('User/Data/Response', data);
				if(data.envData !== undefined)
				{
					$.Gomag.setEnvData(data.envData);
				}

				if(data.wishlistProductCount != undefined && data.wishlistProductCount > 0 && data.wishlistProducts != undefined)
				{
					$.each(data.wishlistProducts, function(i, v){
						$($.Gomag.config.detailsAddToWishlist+v).addClass('-g-added-to-wishlist');
						$($.Gomag.config.listingAddToWishlistGeneral+v).addClass('-g-added-to-wishlist');
					})

				}
				if(data.secureForms !== undefined)
				{
					$.Gomag.secureFormsValues = data.secureForms;
					$.Gomag.secureForms();
				}
				if(data.customerTemplate !== undefined)
				{
					$($.Gomag.config.userSectionTop).html(data.customerTemplate).removeClass($.Gomag.config.userSectionTopEmptyClass);
				}
				if(data.loggedIn !== undefined && data.loggedIn)
				{
					$.Gomag.loggedInCustomer = new LoggedInCustomer();

					$($.Gomag.config.userSectionTop).addClass($.Gomag.config.loggedInUserSecionTopClass);
				}

				if(data.loggedInCustomer != undefined) {
					$.Gomag.loggedInCustomer.create(data.loggedInCustomer);
				}

				if(
					data.backendEditWidget != undefined &&
					data.backendEditWidget &&
					window.self === window.top &&
					$('.-g2-help-widget-holder').length === 0
				) {
					$('body').append(data.backendEditWidget).addClass('-g2-help-widget-loaded');
				}

				$.Gomag.setRuleCountdown(data);

				$.each((data && data.envData && data.envData.products) || {}, function(i, v) {
					if($($.Gomag.config.detailsBasePriceWithVat + i).length == 0 && v.basePriceWithVatCurrency != undefined) {
						$($.Gomag.config.listingBasePriceWithVat + i).html(v.basePriceWithVatCurrency);
					}
					$($.Gomag.config.detailsFinalPriceWithVat + i).html(v.finalPriceWithVatCurrency);

					var minRuleQty = $.Gomag.getMinQuantityFromRules(v);
					if(minRuleQty > 1) {
						var currentQty = $($.Gomag.config.addToCartQuantityH + v.id).find($.Gomag.config.addToCartQuantity).val();
						if(currentQty && parseFloat(currentQty) >= minRuleQty) {
							$.Gomag.setProductPriceForQuantity(v.id, currentQty);
						}
					}
				});

				$.Gomag.trigger('User/Ajax/Data/Loaded', {data: data});
				$.Gomag.rebuildCache(data, products);
			},'json');
		},
		rebuildCache: function(data, products)
		{
			if(data.cacheHash == undefined || !data.cacheHash)
			{
				return false;
			}
			let cacheHash = data.cacheHash;
			if(!cacheHash.length)
			{
				return false;
			}
			$.each(cacheHash, function(i, url){
				if(url.indexOf('ppl:') === 0 && products != undefined)
				{

					$.Gomag.getProductsAjaxData(products, url.replace('ppl:',''));
				}
				else
				{
					$.Gomag.ajax(url, {}, 'GET', false, false, true, 100);
				}
			})

		},
		setRuleCountdown: function(data)
		{
			if(data.rulesCountDownTimers != undefined || $.Gomag.rulesCountDownTimers != false){
				if(data.rulesCountDownTimers != undefined){
					$.Gomag.rulesCountDownTimers = data.rulesCountDownTimers;
				}

				var parent = $.Gomag.getProductParentFromEav($.Gomag.productDetailsId);
				var rulesCountDownTimers = $.Gomag.rulesCountDownTimers;

				if(rulesCountDownTimers == undefined || !rulesCountDownTimers.length)
				{
					return false;
				}
				$.each($.Gomag.rulesCountDownTimers, function(parentId, timer){
					if($.Gomag.productDetailsId && $.Gomag.getProductParentFromEav($.Gomag.productDetailsId) && parent == parentId)
					{
						if($.Gomag.rulesCountDownTimersWasSet === true)
						{
							return false;
						}

						$.Gomag.rulesCountDownTimersWasSet = true;

						if(timer.timerDuration > 5)
						{
							$.Gomag.startTimer($.Gomag.config.detailsCountDownTimer + $.Gomag.productDetailsId, timer.timerEnd, timer.timerDuration, function(){ $.Gomag.productChangeVersion({"product":parentId,"version":$.Gomag.productDetailsId, 'nocache': 1}); });
						}
						else
						{
							if($($.Gomag.config.detailsCountDownTimer + $.Gomag.productDetailsId).length)
							{
								$($.Gomag.config.detailsCountDownTimer + $.Gomag.productDetailsId).hide();
							}
							if($($.Gomag.config.detailsDiscountIcon + $.Gomag.productDetailsId).length)
							{
								$($.Gomag.config.detailsDiscountIcon + $.Gomag.productDetailsId).hide();
							}
							if($('.-g-product-discount-percent-' + $.Gomag.productDetailsId).length)
							{
								$('.-g-product-discount-percent-' + $.Gomag.productDetailsId).hide();
							}
							if($('.-g-discount-value').length)
							{
								$('.-g-discount-value').hide();
							}
							$($.Gomag.config.detailsBasePrice + $.Gomag.productDetailsId).addClass('hide').html('');
							$($.Gomag.config.detailsFinalPrice + $.Gomag.productDetailsId).html(timer.productPriceWithCurrency);
						}
					}
					if($.Gomag.getEnvData && $.Gomag.getEnvData.products != undefined && timer.timerEnd != 0)
					{
						$.each($.Gomag.getEnvData.products, function(id, values){
							if(values.parent == parentId)
							{
								$($.Gomag.config.listingBasePrice + id).addClass('hide').html('');
								$($.Gomag.config.listingFinalPrice + id).html(timer.productPriceWithCurrency);
							}
						})
					}
				})
			}

		},
		productAjaxDataResponse: function(data)
		{
			if($($.Gomag.config.selectedCurrency).length && data.selectedCurrency !== undefined){
					$($.Gomag.config.selectedCurrency).html(data.selectedCurrency);
				}
				if(data.envData !== undefined)
				{
					$.Gomag.setEnvData(data.envData);
				}
				if(data.products !== undefined){
					$.each(data.products, function(i, v){
						$.Gomag.addProductListing(i, v, data.selectedCurrency);
						$.Gomag.addProductDetail(i, v, data.selectedCurrency);
						if(v.timerEnd != undefined && v.timerEnd !== false)
						{
							$.Gomag.startTimer($.Gomag.config.detailsCountDownTimer + i, v.timerEnd, v.timerDuration, function(){ $.Gomag.productChangeVersion({"product":v.parent,"version":$.Gomag.productDetailsId, 'nocache': 1}); });
						}
					});
					$.event.trigger('Gomag/Product/Data/Loaded', {products:data.products});
				}
				$.Gomag.eqProductRow();
		},
		getProductsAjaxData: function(products, gcr)
		{
			hash = $.Gomag.buildHash({p:products, v: $.Gomag.productDetailsId});
			var url = $.Gomag.ajaxLoadUserProductsUrl+hash+'&cu='+$.Gomag.getCookie('selectedCurrency');
			if(gcr != undefined && gcr)
			{
				url += '&_gcr='+gcr;
				$.Gomag.ajax(url, {p:products, v: $.Gomag.productDetailsId}, 'POST', false, false, true, 100);
			}
			else
			{
				$.post(url, {p:products, v: $.Gomag.productDetailsId}, function(data){
					$.Gomag.productAjaxDataResponse(data);
				},'json');
			}
		},

		startTimer : function(selector, timerEnd, timerDuration, timerEndCallback)
		{
			if(!$(selector).length)
			{
				return false;
			}
			$(selector).css({'display':'inline'}).removeClass('hide');

			const countdownTimeUnit = ($.Gomag.settings &&  $.Gomag.settings.countdownTimeUnit ) ? $.Gomag.settings.countdownTimeUnit : $this.settings.countdownTimeUnit;
			const countdownTimeUnitIncludeDays = ($.Gomag.settings &&  $.Gomag.settings.countdownTimeUnitIncludeDays ) ? $.Gomag.settings.countdownTimeUnitIncludeDays : 0;
			const countdownTimeUnitExcludeSeconds = ($.Gomag.settings &&  $.Gomag.settings.countdownTimeUnitExcludeSeconds ) ? $.Gomag.settings.countdownTimeUnitExcludeSeconds : 0;
			const separator = "<span class='countdown-separator'>:</span>";
			$secondsText = countdownTimeUnitExcludeSeconds ? '' : separator + '%S' + countdownTimeUnit.timeUnitSeconds;

			$(selector).countdown(timerEnd, function(event) {

				if(event.offset.totalDays > 0 && countdownTimeUnitIncludeDays)
				{
					$(this).html(event.strftime(event.offset.totalDays + countdownTimeUnit.timeUnitDays + separator + event.offset.hours + countdownTimeUnit.timeUnitHours + separator + '%M' + countdownTimeUnit.timeUnitMinutes + $secondsText));
				}
				else if(event.offset.totalHours > 0)
				{
					$(this).html(event.strftime(event.offset.totalHours + countdownTimeUnit.timeUnitHours + separator + '%M' + countdownTimeUnit.timeUnitMinutes + $secondsText));
				}
				else if(event.offset.minutes > 0)
				{
					$(this).html(event.strftime(event.offset.minutes + countdownTimeUnit.timeUnitMinutes + $secondsText));
				}
				else
				{
					$(this).html(event.strftime(event.offset.seconds + countdownTimeUnit.timeUnitSeconds));
				}
			}).on('finish.countdown', function(){ $(selector).hide(); });
			if(parseInt(timerDuration)>0 && parseInt(timerDuration)<720) {
					timerDuration = parseInt(timerDuration)*parseInt(1000);
					setTimeout(function() {
						if(timerEndCallback !== undefined && typeof timerEndCallback === 'function')
						{
							timerEndCallback();
						}
						else if(timerEndCallback !== undefined)
						{
							$(selector).trigger(timerEndCallback);
						} else {
							$(selector).fadeOut('slow');
						}
					}, timerDuration);

				}
		},
		productAjax : function(dataUrl, dataSelector, dataAttr, dataFunction){
			function blink(selector){
				$(selector).fadeOut('slow', function(){
					$(this).fadeIn('slow', function(){
						blink(this);
					});
				});
			}

			var productsId = $(dataSelector).map(function() {
			  return $(this).data(dataAttr);
			}).get();


			$.post(dataUrl, {products:productsId}, function(data){
				var countdownTimeout = 0;
				var countdownTimeoutId = 0;

				$(dataSelector).each(function() {
					var productId = $(this).data(dataAttr);


					if(productId != undefined && data.products[productId] !== undefined && data.products[productId].withDiscount !== undefined && data.products[productId].activeDiscount !== undefined) {
						if(data.products[productId].withDiscount === true && data.products[productId].activeDiscount === false) {

							dataFunction($(this));
							$(this).find('.text-main').html(data.products[productId].finalPrice);

						} else {
							if(data.products[productId].withDiscount === true && data.products[productId].activeDiscount === true) {

								if(data.products[productId].timerEnd != 0) {
									if(parseInt(countdownTimeout) == 0) {
										countdownTimeout = data.products[productId].timerDuration;
										countdownTimeoutId = productId;
									} else {
										if(parseInt(countdownTimeout)>parseInt(data.products[productId].timerDuration)) {
											countdownTimeout = data.products[productId].timerDuration;
											countdownTimeoutId = productId;
										}
									}

									//show special price for product

									$(this).find('.price-full').html(data.products[productId].basePrice);
									$(this).find('.text-main').html(data.products[productId].finalPrice);
									$(this).find('.product-icon-box').html(data.products[productId].discountPercent);

									$('#_countDown_'+productId).css({'display':'inline'});

									$('#_countDown_'+productId).countdown(data.products[productId].timerEnd, function(event) {
										const countdownTimeUnit = ($.Gomag.settings &&  $.Gomag.settings.countdownTimeUnit ) ? $.Gomag.settings.countdownTimeUnit : $this.settings.countdownTimeUnit;
										const countdownTimeUnitIncludeDays = ($.Gomag.settings &&  $.Gomag.settings.countdownTimeUnitIncludeDays ) ? $.Gomag.settings.countdownTimeUnitIncludeDays : 0;
										const countdownTimeUnitExcludeSeconds = ($.Gomag.settings &&  $.Gomag.settings.countdownTimeUnitExcludeSeconds ) ? $.Gomag.settings.countdownTimeUnitExcludeSeconds : 0;
										const separator = "<span class='countdown-separator'>:</span>";
										$secondsText = countdownTimeUnitExcludeSeconds ? '' : separator + '%Ss';
										if(event.offset.totalDays > 0 && countdownTimeUnitIncludeDays)
										{
											$(this).html(event.strftime(event.offset.totalDays + countdownTimeUnit.timeUnitDays + separator + event.offset.hours + countdownTimeUnit.timeUnitHours + separator + '%Mm' + $secondsText));
										}
										else if(event.offset.totalHours > 0)
										{
											$(this).html(event.strftime(event.offset.totalHours + countdownTimeUnit.timeUnitHours + separator + '%Mm' + $secondsText));
										}
										else if(event.offset.minutes > 0)
										{
											$(this).html(event.strftime(event.offset.minutes + countdownTimeUnit.timeUnitMinutes + $secondsText));
										}
										else
										{
											$(this).html(event.strftime(event.offset.seconds  + countdownTimeUnit.timeUnitSeconds));
										}

									});
								}
							}
						}
					}
				});

				if(parseInt(countdownTimeout)>0 && parseInt(countdownTimeout)<720) {
					countdownTimeout = parseInt(countdownTimeout)*parseInt(1000);
					setTimeout(function() {
						$('#_timeExpired').val(1);
						blink('#_countDown_'+countdownTimeoutId);
					}, countdownTimeout);

				}

			},'json');

		},
		setProductsImages : function(){
			$('.listImage').each(function(){
				if($(this).attr('data-image')){

					$(this).attr('src', $(this).attr('data-image')).removeClass('hidden');
					$(this).attr('data-image', '');
				}
			})
		},
		cookieExists: function(cookieName)
		{

			if (typeof $.cookie(cookieName) === 'undefined' || $.cookie(cookieName) === null ||  $.cookie(cookieName) === false){
				 return false;
				} else {
				 return true;
				}
		},
		setCookie : function(cookieName, cookieValue, cookieExpire, closeFancybox, callback){
			cookieExpire = cookieExpire != '' ? cookieExpire : defaultCookieTime;
			var expires = new Date();
            expires.setTime(expires.getTime() + parseInt(cookieExpire));
			document.cookie = encodeURIComponent(cookieName) + "=" + encodeURIComponent(cookieValue) + '; expires='+ expires.toUTCString() + "; path=/";

			if(callback !== undefined && typeof callback === 'function')
			{
				$('body').trigger(callback);
			}

			if(closeFancybox && typeof $.fancybox !== "undefined"){
				$.fancybox.close();
			}
		},
		getCookie: function(cname) {
		  let name = cname + "=";
		  let decodedCookie = decodeURIComponent(document.cookie);
		  let ca = decodedCookie.split(';');
		  for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
			  c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
			  return c.substring(name.length, c.length);
			}
		  }
		  return "";
		},
		ajax : function(url, data, method, callback, dataResponse, asyncAjax, timeout, extraOptions){
			var vars = data;
			var isFormData = (typeof FormData !== 'undefined' && vars instanceof FormData);

			var ajaxConfig = {
			  url: url,
			  dataType : 'json',
			  data : vars,
			  async : asyncAjax != undefined ? asyncAjax : true,
			  method : method != '' && method !== undefined ? method : 'GET',
			  timeout: timeout != undefined ? timeout : 0,
			  processData : isFormData ? false : true,
			  contentType : isFormData ? false : 'application/x-www-form-urlencoded; charset=UTF-8'
			};
			if (extraOptions && typeof extraOptions === 'object') {
				$.extend(ajaxConfig, extraOptions);
			}

			$.ajax(ajaxConfig).always(function(arg1, textStatus, arg3) {
				var jqXHR = (textStatus === 'success' || textStatus === 'notmodified') ? arg3 : arg1;
				if(callback != '' && callback !== undefined){

					if(typeof callback === 'function'){
						if(dataResponse != '' && dataResponse !== undefined){
							if(dataResponse == 'responseJSON')
							{
								callback(jqXHR.responseJSON || null);
							}
							else
							{
								callback(jqXHR.responseText);
							}
						}
						else
						{
							callback(jqXHR.responseText);
						}
					} else {

						$('body').trigger(callback, jqXHR.responseJSON);
					}
				};
			});

		},
		setVoucherFieldDisplayOption : function(value){
			$.Gomag.voucherFieldDisplayOption = value;
		},
		getVoucherFieldDisplayOption : function(){
			return $.Gomag.voucherFieldDisplayOption;
		},
		showCartSummary : function(cartSummarySelector){
			if($(cartSummarySelector).html())
			{
				$('div._cartShow').addClass('cart-open');
			}
			else
			{
				$.Gomag.ajax(
							this.cartSummaryUrl,
							{},
							'POST',
							function(data){
								$(cartSummarySelector).html(data);
								$('div._cartShow').addClass('cart-open');
							}
						);
			}
		},
		hideCartSummary : function(cartSummarySelector){
			$(cartSummarySelector).removeClass('cart-open');
		},
		autocomplete : function(url, minLength, dataType, element, responseCallback, selectCallback){

			 $(element).autocomplete({
				source		:	url,
				minLength	:	minLength !== undefined && minLength != '' ? minLength : 2,
				dataType	:	dataType !== undefined && dataType != '' ? dataType : "json",
				select		: 	function (event, selected) {

					if(selectCallback != '' && selectCallback !== undefined){
						$('body').trigger(selectCallback, selected.item);
					}
				},
				response	: 	function (event, suggestions) {

					if(responseCallback != '' && responseCallback !== undefined){
						$('body').trigger(responseCallback, suggestions);
					}
				}
			});
		},

		setWidgetEnviroment : function(){
			var get = [];
			var environment = $.Gomag.environment;
			$.each(environment, function(i, v){

				if(i == 'Product/Category'){
					get.push('c='+v);
				}
				if(i == 'Product'){
					get.push('p='+v);
				}
				if(i == 'Product/HasDiscount'){
					get.push('disc='+(v ? 1 : 0));
				}
				if(i == 'Product/StockStatus'){
					get.push('pss='+(v));
				}
				if(i == 'Page/Order' || i == 'Page/OrderCheckout' || i == 'Page/OrderComplete'){
					get.push('pid='+(v));
				}
				if(i == 'Page' && v == 'account'){
					get.push('acc='+(v));
				}

				if(i == 'Page' && v != 'account'){
					get.push('pg='+(v));
				}
				if(i == 'Page/Homepage'){
					get.push('pg='+(v));
				}

				if(i == 'Product/Brand'){
					get.push('b='+v);
				}

				if(i == 'BlogHomepage' || i == 'BlogPost' || i == 'BlogCategory'){
					get.push('blog='+v);
				}
				if(i == 'Product/AllCategories'){
					get.push('pac='+(v));
				}


			});

			return get;
		},
		triggerLoadWidget : function(type){
			if(type == 'blocks'){
				$.Gomag.triggerBlocks(type);
			}
			if(widgets[type] === undefined){
				if(type == 'hellobar:onload')
				{
					$('.Gomag-HelloBar').remove();
					$('#_gomagHellobar').hide();
				}
				return false;
			}
			if(type == 'hellobar:onload'){
				$.Gomag.triggerHelloBar(type);
			}
			if(type == 'cookiePolicy:onload'){
				setTimeout(function() {
					$.Gomag.triggerCookiePolicy(type);
				}, 2300);
			}
			if(type == 'popup:onload'){
				var cookie = $.Gomag.triggerPopup(type);
			}

			if(type == 'popup:onexit'){
				var cookie = $.Gomag.triggerPopup(type);
				if(cookie){
					$.Gomag.setCookie(cookie, 1, defaultCookieTime);
				}
			}
			if(type == 'popup:onscroll:50'){
				var cookie = $.Gomag.triggerPopup(type);
				if(cookie){
					$.Gomag.setCookie(cookie, 1, defaultCookieTimeOneDay);
				}
			}
			return cookie;
		},

		triggerHelloBar : function(type){
			$('#_gomagHellobar').html('');
			$.each(widgets[type], function(i, v){
				$('#_gomagHellobar').append(v['element'].split(['[newLine]']).join("\n"));
				$('#_gomagHellobar').removeClass('-g-hide');
				$('#_gomagHellobar').addClass('hellobar-loaded');
			});
		},
		getWidgets : function(type, key){
			if(widgets[type] !== undefined){

				if(key !== undefined){
					if(widgets[type][key] !== undefined){
						return widgets[type][key];
					} else {
						return false;
					}
				}

				return widgets[type];
			}
			return false;
		},
		triggerCookiePolicy : function(type){

			$.each(widgets[type], function(i, v){

				$('body').append(v['element'].split(['[newLine]']).join("\n"));
				$.Gomag.trigger('Cookie/Policy/Display');
			})
		},
		triggerBlocks : function(type){

			$.each(widgets, function(key, widget)
			{
				if(key.indexOf(type) >= 0)
				{
					$.each(widget, function(wkey, w){

						var data = w.data;
						if(data.addType == 'before'){
							if(data.elementSelector != undefined && data.elementSelector && $(data.elementSelector).length)
							{
								return true;
							}
							$(data.addSelector).before(w.element);
						}
					})
				}
			});
		},
		triggerPopup : function(type){
			var setted = '';

			// if(widgets['cookiePolicy:onload'] !== undefined){
				// return false;
			// }

			$.each(widgets[type], function(i, v){

				if(document.cookie.indexOf(i) >= 0){
					return true;
				}

				options = {
					//width: v.data.popupWidth !== undefined && parseInt(v.data.popupWidth) > 0 ? v.data.popupWidth+'px' : '640px',
					//height: v.data.popupHeight !== undefined && parseInt(v.data.popupHeight) > 0 ? v.data.popupHeight+'px' : '',

					toolbar : false,
					padding: '0',
					modal: type == 'popup:onload' && v.data.popupType != 'messenger' ? true : false,
					type: 'inline',
					baseClass: '-g-widget-fbHolder',
					src : v.element
				};
				if(v.data.popupWidth !== undefined && parseInt(v.data.popupWidth) > 0 || v.data.popupHeight !== undefined && parseInt(v.data.popupHeight) > 0){
					//options['fitToView'] = true;
					//options['autoSize'] = false;
					options['afterLoad'] = function () {
						//this.width = parseInt(v.data.popupWidth) > 0 ? parseInt(v.data.popupWidth) : 640;
					}
				} else {
					//options['fitToView'] = true;
					//options['autoSize'] = true;
				}
				if(v.data.displayPopupDelay != undefined && v.data.displayPopupDelay == 'custom' && v.data.displayPopupDelayCustom != undefined && parseInt(v.data.displayPopupDelayCustom) != NaN && parseInt(v.data.displayPopupDelayCustom) > 1)
				{
					setTimeout(function(){$.Gomag.openPopup(options)}, parseInt(v.data.displayPopupDelayCustom) * 1000);
				}
				else if(v.data.displayPopupDelay != undefined && parseInt(v.data.displayPopupDelay) != NaN && parseInt(v.data.displayPopupDelay) > 500)
				{
					setTimeout(function(){$.Gomag.openPopup(options)}, parseInt(v.data.displayPopupDelay));
				}
				else
				{
					$.Gomag.openPopup(options);
				}

				if(v.data.popupType == 'messenger')
				{
					$.Gomag.setCookie(i, 1, defaultCookieTimeOneDay);
				}
				else
				{
					setted = i;
				}
			})
			return setted;
		},

		openPopup : function(options, selector){

			options = options ? (typeof options === 'string' ? JSON.parse(options) : options) : {};

			if(selector !== undefined && (options.type == undefined || (options.type != 'iframe'))){

				options['src'] = selector;
			}
			$.fancybox.open(options);
		},

		openPopupWithData : function(selector, options){
			$.Gomag.envData.extraData = [];
			options.beforeLoad	= function(){
				$.Gomag.trigger('Gomag/OpenPopupWithData/BeforeLoad');
			}
			defaultOptions = {
				type: 'iframe',
				toolbar : false,
				smallBtn: 'true'
			};

			options = deepmerge(defaultOptions, options); //.concat(options);
			//options = deepmerge(options, defaultOptions); //.concat(options);
			//options = {...defaultOptions, ...options};
			$.Gomag.openPopup(options, selector);
		},
		openDefaultPopup : function(selector, options){


			defaultOptions = {
				type: 'iframe',
				toolbar : false,
				smallBtn: 'true'
			};

			options = deepmerge(defaultOptions, options); //.concat(options);
			//options = deepmerge(options, defaultOptions); //.concat(options);
			//options = {...defaultOptions, ...options};
			$.Gomag.openPopup(options, selector);
		},

		loadWidgets : function(isCartRecoveryAjax = false, cartSubtotal = 0){
			if( !isCartRecoveryAjax && !$('script#__gomagWidget').length && $.Gomag.widgetUrl){
				var get 		= this.setWidgetEnviroment();
				var script		=	document.createElement('script');
				script.type		=	'text/javascript';
				script.id		=	'__gomagWidget';
				script.async	=	true;
				script.src		=	$.Gomag.widgetUrl+'?'+(get.join('&'));
				document.body.appendChild(script);

			}
			if(isCartRecoveryAjax &&  $.Gomag.widgetUrl ){
				cartSubtotal = cartSubtotal ? cartSubtotal : 0;
				var get 		= this.setWidgetEnviroment();
				let cartRecoveryAjaxUrl = $.Gomag.widgetUrl+'?'+(get.join('&'))+'&cartRecoveryAjax=1';

				cartRecoveryAjaxUrl += '&cartValue='+cartSubtotal;
				$.Gomag.ajax(cartRecoveryAjaxUrl, {}, 'GET', function(widgetList) {
					if (widgetList && typeof widgetList === 'object' && widgetList.length) {
						if (typeof widgets !== 'undefined' && typeof widgets['popup:onexit'] !== 'undefined') {
							$.each(widgets['popup:onexit'], function(i, v) {
								if (v.data && v.data.popupType === 'cartRecovery') {
									delete widgets['popup:onexit'][i];
								}
							});
						}
						for (var i = 0; i < widgetList.length; i++) {
							var w = widgetList[i];
							$.Gomag.setWidget(
								w.key,
								w.type + ':' + (w.trigger ? w.trigger : 'onexit'),
								w.element,
								w.data
							);

						}
					}
				}, 'responseJSON');
			}
		},
		setWidget : function(key, type, element, data){

			if(widgets[type] === undefined){
				widgets[type] = {};
			}

			widgets[type][key] = {'key': key, 'type': type, 'element':element, 'data':data};

		},

		changeComponent: function(url, selectors, beforeAjax, afterAjax){
			typeof beforeAjax === 'function'
							?
							beforeAjax()
							:
							''
				;
			$.get(url, {}, function(data){
				if(selectors == ''){
					return false;
				} else if(typeof selectors == 'object'){
					$.each(selectors, function(selector, dataKey){
						if(data[dataKey] != undefined){
							$(selector).html(data[dataKey]);
						}
					});
					typeof afterAjax === 'function'
							?
							afterAjax()
							:
							''
						;
					} else if(typeof selectors == 'string'){

				}
			}, 'json');

		},
		triggerLoadWidgetKey : function(type, key){

			v = $.Gomag.getWidgets(type, key);

			options = {
				toolbar : false,
				smallBtn: true,
				baseClass: "customPopup -g-widget-fbHolder",

				padding: '0',
				modal: type == 'popup:onload' ? true : false,
				type: 'inline',
				src : v.element
			};
			$.Gomag.openPopup(options);

		},
		addWidgetTrigger: function(){
			$('.__gomagWidget').each(function(){
				var element = $(this);

				var condition = $(this).attr('data-condition');

				var response =JSON.parse(condition);

				if(response){

					var widgetType = $(this).attr('data-popup');

					widgetsList = $.Gomag.getWidgets(widgetType);

					if(widgetsList !== false){
						$.each(widgetsList, function(i, v){
							var data = v.data;
							var found = true;
							var checkValues = {};

							$.each(response, function(dataKey, dataValue){
								if(data[dataKey] === undefined){
									return true;
								}

								if(dataKey == 'displayCategories' && data['displayLocation'] == ''){
									data['displayCategories'] = dataValue;
								}
								if(typeof data[dataKey] != 'object'){
									//checkValues[dataKey] = [{dataKey, data[dataKey]}];
								} else {
									checkValues[dataKey] = data[dataKey];
								}


							})

							$.each(checkValues, function(index, value){

								if(response[index] === undefined){
									found = false;

								}

								var toCheck = typeof response[index] == 'object' ? response[index] : [response[index]];
								var toCheckValues = typeof value == 'object' ? value : [value];

								if(found){
									var matched = $(toCheck).filter(toCheckValues);
									if(matched.length == 0){
										found = false;
									}
								}

							});
							if(found){

								element.html('<a href="#" style="'+(data['confirmColor'] !== undefined && data['confirmColor'] ? 'color: '+data['confirmColor']+' !important;' : '')+(data['confirmBackground'] !== undefined && data['confirmBackground'] ? 'background: '+data['confirmBackground']+' !important;' : '')+'" class="informationWidget -g-no-url" onClick="$.Gomag.triggerLoadWidgetKey(\''+widgetType+'\',\''+i+'\')">'+(data['confirmText'] ? data['confirmText'] : 'Informatii')+'</a>');
								return false;
							}
						})
					}
				}
			})
			$.Gomag.trigger('Widget/Add/After');
		},
		/*add to cart*/
		parseNumber : function(type, number)
		{

			return type == 'float' ? parseFloat(number) : parseInt(number);

		},

		getCartProductQuantity : function(productId, addToCartTrigger, quantity){

			if($.Gomag.envData.products[productId] == undefined)
			{
				return 1;
			}
			var product = $.Gomag.envData.products[productId];

			var selectedQuantity = quantity != undefined ? quantity : $($.Gomag.config.addToCartQuantityH + product.id).find($.Gomag.config.addToCartQuantity).val();
			if(selectedQuantity == undefined)
			{
				selectedQuantity = 1;
			}
			var quantity = selectedQuantity;
			var stepQuantity = product.stepQuantity;
			var minRuleQty = $.Gomag.getMinQuantityFromRules(product);
			var orderMinimQuantity = minRuleQty > 0 ? product.stepQuantity : product.orderMinimQuantity;
			var productQuantity = product.productQuantity;

			if(parseFloat(orderMinimQuantity) % 1 === 0 && parseFloat(stepQuantity) % 1 === 0){
				var parseType = 'int';
				var fixedCount = 0;
				var quantityMultiplier = 1;
			} else {
				var parseType = 'float';
				var fixedCount = $.Gomag.productsStockDecimals;
				var quantityMultiplier = Math.pow(10, fixedCount);
			}
			quantity = quantity > product.stock ? product.stock : quantity;
			if(parseFloat(quantity) <= parseFloat(0))
			{
				var quantity = 0;
				quantity = quantity.toFixed(fixedCount);
			} else if(parseFloat(quantity) < parseFloat(orderMinimQuantity)){
				var quantity = orderMinimQuantity.toFixed(fixedCount);
			} else if(parseFloat(quantity) < parseFloat(stepQuantity)){
				var quantity = orderMinimQuantity.toFixed(fixedCount);
			} else{

				var roundedQuantity = Math.round(quantity*quantityMultiplier);
				var roundedStepQuantity = Math.round(stepQuantity*quantityMultiplier);
				var roundedMinimQuantity = Math.round(orderMinimQuantity*quantityMultiplier);

				var roundedRest = ((roundedQuantity - roundedMinimQuantity) % roundedStepQuantity).toFixed($.Gomag.productsStockDecimals);
				var newRoundedQuantity = (parseFloat(quantity) - roundedRest/quantityMultiplier).toFixed(fixedCount);
				var quantity = newRoundedQuantity;

			}
			if(quantity.indexOf(".") >= 0){
				quantity = quantity.replace(/0+$/g,'');
				quantity = quantity.replace(/\.$/g,'');
			}
			product.productQuantity = quantity;

			return quantity;
		},

		getMinQuantityFromRules: function(product) {
			if(!product || !product.priceListQuantity) {
				return 0;
			}
			var minRuleQty = 0;
			$.each(product.priceListQuantity, function(qty, rule) {
				var qtyNum = parseFloat(qty);
				if(qtyNum > 1 && (minRuleQty === 0 || qtyNum < minRuleQty)) {
					minRuleQty = qtyNum;
				}
			});
			return minRuleQty;
		},

		setProductPriceForQuantity: function(productId, quantity)
		{

			if(productId == undefined || quantity == undefined || $.Gomag.envData.products[productId] == undefined || $.Gomag.envData.products[productId]['priceListQuantity'] == undefined || ($.Gomag.settings.displayPRPAsBasePrice && $.Gomag.settings.displayPRPAsBasePrice !== "0"))
			{
				return false;
			}

			var ruleQuantity = false;
			$.each($.Gomag.envData.products[productId]['priceListQuantity'], function(i, v){
				if(parseFloat(i) <= parseFloat(quantity))
				{
					ruleQuantity = i;
				}
			});

			var data = {};
			data.product = productId;
			data.price = $.Gomag.envData.products[productId]['price'];
			data.priceCurrency = $.Gomag.envData.products[productId]['currency'];
			data.basePrice = $.Gomag.envData.products[productId]['basePrice'];
			data.priceAddon = parseFloat(typeof getProductConfigurationsPrice == 'function' ? getProductConfigurationsPrice() : 0);
			if(ruleQuantity !== false)
			{
				var rulePriceNoCurrency = $.Gomag.envData.products[productId]['priceListQuantity'][ruleQuantity]['priceNoCurrency'];
				var basePriceForComparison = $.Gomag.envData.products[productId]['priceListQuantity'][1] ? $.Gomag.envData.products[productId]['priceListQuantity'][1]['priceNoCurrency'] : data.price;
				if(parseFloat(rulePriceNoCurrency) < parseFloat(basePriceForComparison))
				{
					data.priceRule = $.Gomag.envData.products[productId]['priceListQuantity'][ruleQuantity]['price'];
					data.price = rulePriceNoCurrency;
				}
			}
			var tmp = {};
			tmp.canChange = true;


			$.Gomag.trigger('Product/Quantity/Change/Price/Update/Before', {data : tmp});

			if(tmp.canChange)
			{
				var basePriceRaw = parseFloat(data.basePrice + data.priceAddon);
				var priceRaw = parseFloat(data.price + data.priceAddon);
				var basePrice = $.Gomag.applyPriceDisplayFilter(basePriceRaw);
				var basePriceCurrency = $.Gomag.numberFormatPrice(basePrice);
				var price = $.Gomag.applyPriceDisplayFilter(priceRaw);
				var finalPriceCurrency = $.Gomag.numberFormatPrice(price);
				var priceCurrency = data.priceCurrency;
				var product = data.product;
				var discountPercent = '';
				var discountValue = '';
				var showDiscountValue = $.Gomag.settings && $.Gomag.settings.discountDisplayType == 'value';
				var discountDisplayRoundPrecision = $.Gomag.settings && $.Gomag.settings.discountDisplayRoundPrecision != undefined ? parseInt($.Gomag.settings.discountDisplayRoundPrecision, 10) : 0;
				discountDisplayRoundPrecision = isNaN(discountDisplayRoundPrecision) || discountDisplayRoundPrecision < 0 ? 0 : discountDisplayRoundPrecision;
				if(parseFloat(price) < parseFloat(basePrice))
				{
					discountPercent ='-'+((100 - (price * 100 / basePrice)).toFixed(0))+'%';
					var discountRoundMultiplier = Math.pow(10, discountDisplayRoundPrecision);
					discountValue = parseFloat(basePrice) - parseFloat(price);
					discountValue = Math.round(discountValue * discountRoundMultiplier) / discountRoundMultiplier;
					var discountLabel = showDiscountValue ? ('-' + discountValue + ' ' + priceCurrency) : discountPercent;

					if($($.Gomag.config.detailsDiscountIcon+product).length)
					{
						$($.Gomag.config.detailsDiscountIcon+product).removeClass('hide');
						$($.Gomag.config.detailsDiscountIcon+product).html(discountLabel);
						if(showDiscountValue) {
							$($.Gomag.config.detailsDiscountIcon+product).addClass('-g-icon-discount-value');
						} else {
							$($.Gomag.config.detailsDiscountIcon+product).removeClass('-g-icon-discount-value');
						}
					}
					else
					{
						$($.Gomag.config.detailsIconBox).append('<span class="icon discount bg-main '+$.Gomag.config.detailsDiscountIconClass+product+(showDiscountValue ? ' -g-icon-discount-value' : '')+'">'+discountLabel+'</span>');
					}
					if(showDiscountValue && $($.Gomag.config.detailsDiscountValue + product).length)
					{
						$($.Gomag.config.detailsDiscountValue + product).html(discountValue);
					}
					if($('.-g-product-discount-percent-'+product).length)
					{
						$('.-g-product-discount-percent-'+product).html('('+discountPercent+')');
					}
					if(!$('.-g-product-full-price-'+product).length)
					{
						$('.-g-product-final-price-'+product).before('<s><span class="bPrice -g-product-full-price-'+product+'">'+basePriceCurrency+' '+priceCurrency+'</span></s>')
					}
					else
					{
						$('.-g-product-full-price-'+product).html(basePriceCurrency+' '+priceCurrency);
					}
					$('.-g-product-final-price-'+product).text(finalPriceCurrency+' '+priceCurrency);
				}
				else
				{
					$('.-g-product-full-price-'+product).html('');
					$('.-g-product-final-price-'+product).text(finalPriceCurrency+' '+priceCurrency);

					if($($.Gomag.config.detailsDiscountIcon+product).length)
					{
						$($.Gomag.config.detailsDiscountIcon+product).remove();
					}
					if($('.-g-product-discount-percent-'+product).length)
					{
						$('.-g-product-discount-percent-'+product).html('');
					}

				}
			}

		},
		addPackageToCart : function(cartItems, package)
		{

			if($.Gomag.envData.products[cartItems.getMain().product] == undefined)
			{
				return false;
			}
			var packageToAdd = false;
			var packageMultiplier = 1;
			var productPackages = $.Gomag.envData.products[cartItems.getMain().product].packages;
			var productQuantity = cartItems.getMain().quantity;

			if(package == 'default')
			{

				if(Object.keys(productPackages).length)
				{
					$.each(productPackages, function(r, p)
					{

						if((p.type == 'package:free' || p.type == 'package:sameFree') && parseFloat(p.reqQuantity) <= parseFloat(productQuantity))
						{
							packageMultiplier = Math.floor(parseFloat(productQuantity)/parseFloat(p.reqQuantity));
							packageToAdd = p;
							return false;
						}
					})
				}

			}
			else if(productPackages[package] != undefined)
			{
				packageToAdd = productPackages[package];
			}

			if(packageToAdd !== false)
			{
				var packageProducts = JSON.parse(packageToAdd.products);
				var packageQuantities = JSON.parse(packageToAdd.quantity);
				var packageRequestQuantity = packageToAdd.reqQuantity;

				if(cartItems.getMain().quantity < packageRequestQuantity)
				{
					var main = cartItems.getMain();
					main.quantity = packageRequestQuantity;
					cartItems.replaceMainElement(main);
				}

				$.each(packageProducts, function(key, product){
					cart = new cartItem;
					cart.product = parseInt(product);
					cart.quantity = packageQuantities[key]*packageMultiplier;

					cart.parent = cartItems.getMain().product;
					cart.rule = packageToAdd.rule;
					cartItems.setItem(cart);
				})

			}
		},
		validateAddToCart: function(params)
		{
			var isValid = {
				'noError' : true
			};

			isValid.noError = true;
			isValid.noError = params.p == undefined ? false : isValid.noError;

			if(typeof params.p != 'object'){

				isValid.noError = $($.Gomag.config.detailsAddToCart + params.p).hasClass($.Gomag.config.addToCartDisababled) ? false : isValid.noError;
			}
			if(isValid.noError){
				$.Gomag.trigger('Product/Add/To/Cart/Validate', isValid);
			}

			return isValid.noError;
		},
		addToCart : function(params)
		{
			if(!$.Gomag.validateAddToCart(params))
			{
				return false;
			}
			if(typeof params.p != 'object'){
				if(params.p == undefined || $($.Gomag.config.detailsAddToCart + params.p).hasClass($.Gomag.config.addToCartDisababled))
				{
					return false;
				}
			}

			cart = new cartItem();

			cart.product = params.p;
			cart.quantity = params.ignoreCartProductQuantity != undefined && params.ignoreCartProductQuantity && params.q != undefined && parseFloat(params.q) > 0 ? params.q : $.Gomag.getCartProductQuantity(params.p, false, params.q);
			if(cart.quantity <= 0)
			{
				return false;
			}
			cart.parent = 0;
			cart.rule = 0;
			cart.configurations = '';
			if(params.sugestedPayment){
				cart.extraData = {'sugestedPayment':params.sugestedPayment};
			}
			if(params.packageConfigurations == 1)
			{
				cart.userPopUpConfigurations = true;
			}
			var cartItems = new cartCollection;
			if(params.ignorePopup != undefined && params.ignorePopup)
			{
				$.Gomag.addToCartPopup.setIgnorePopup(params.ignorePopup);
			}
			if(!params.oneTimeOffer == 1)
			{
				cartItems.setMainElement(cart);
				cartItems.setLocation(params.l != undefined ? params.l : 'd');

			} else if(params.oneTimeOffer == 1 && typeof params.p == 'object')
			{
				$.each(params.p, function(pr, qu){

					var cart = new cartItem();
					cart.product = pr;
					cart.quantity = qu;

					cart.parent = 0;
					cart.rule = params.rc;
					cartItems.setItem(cart);
				})

				cartItems.setLocation(params.l != undefined ? params.l : 'd');

			}

			if(params.r != undefined)
			{
				$.Gomag.addPackageToCart(cartItems, params.r);
			}
			else
			{
				$.Gomag.addPackageToCart(cartItems, 'default');
			}

			$.Gomag.trigger('Product/Add/To/Cart', {cartItems: cartItems}, function (){

				if(cartItems.getAddToCartOk() === true)
				{
					if(params.l != undefined && params.oneTimeOffer != 1)
					{
						if(params.l == 'd')
						{
							$($.Gomag.config.detailsAddToCart + params.p).addClass($.Gomag.config.addToCartDisababled);
						}
						else
						{
							$($.Gomag.config.listingAddToCart + params.p).addClass($.Gomag.config.addToCartDisababled);
						}
					}
					$.Gomag.addToCartAjax(cartItems);
				}
			});

		},
		addToCartAjax : function(cartItems)
		{

			var product = $.Gomag.envData.products[cartItems.getMain().product] != undefined ? $.Gomag.envData.products[cartItems.getMain().product] : {id: cartItems.getMain().product};

			if(product.stock && cartItems.getMain().quantity && product.stock == cartItems.getMain().quantity)
			{
				$($.Gomag.config.detailsAddToCart + product.id).trigger('hideAddToCartButton');
			}
			$.Gomag.ajax($.Gomag.addToCartUrl, {cart: cartItems.prepareForCart()}, 'POST', function(data){
				$('div._cartShow').html('');
				var tmpData = JSON.parse(data);

				if(tmpData && tmpData.cartPopupRecommendationsSlider != undefined)
				{
					if(tmpData.cartPopupRecommendationsSlider != '')
					{
						$.Gomag.addToCartPopup.setBlocking(true);
					}
					else
					{
						$.Gomag.addToCartPopup.setBlocking(false);
					}
					$.Gomag.addToCartPopup.setRecommendedProducts(tmpData.cartPopupRecommendationsSlider != '' ? tmpData.cartPopupRecommendationsSlider : $.Gomag.addToCartPopup.simpleTemplate);
					$.Gomag.addToCartPopup.setDefaultTemplate($.Gomag.addToCartPopup.simpleTemplate);
				}
				if (tmpData && tmpData.outOfStockProducts != undefined && tmpData.outOfStockProducts) {
					$.Gomag.addToCartPopup.displayProductOutOfStock(product);
					$.Gomag.productChangeVersion({"product":product.id,"version":$.Gomag.productDetailsId, nocache : 1})
					return false;
				}
				if (tmpData && tmpData.outOfStockConfigurationProducts != undefined && tmpData.outOfStockConfigurationProducts && tmpData.outOfStockConfigurationProducts.cartErrorMessage != undefined) {

					var configProductError = tmpData.outOfStockConfigurationProducts.cartErrorMessage ? tmpData.outOfStockConfigurationProducts.cartErrorMessage : '';

					$.Gomag.addToCartPopup.displayProductOutOfStock(product, configProductError);
					$.Gomag.productChangeVersion({"product":product.id,"version":$.Gomag.productDetailsId, nocache : 1})
					return false;
				}
				if(tmpData && tmpData.cartLimitReached != undefined && tmpData.cartLimitReached)
				{
					$.Gomag.addToCartPopup.displayLimitReached(product);
					$.Gomag.addToCartPopup.setIgnorePopup(true);
					if(cartItems.getLocation() == 'l')
					{
						$($.Gomag.config.listingAddToCart + product.id).removeClass($.Gomag.config.addToCartDisababled);


					}
					if(cartItems.getLocation() == 'd')
					{
						$($.Gomag.config.detailsAddToCart + product.id).removeClass($.Gomag.config.addToCartDisababled);
					}
					return false;
				}

				product.cartQuantity = cartItems.getMain().quantity;
				$.Gomag.trigger('Product/Add/To/Cart/After', {product: product, data: data}, function (){});

				if(cartItems.getLocation() == 'l')
				{
					$.Gomag.trigger('Product/Add/To/Cart/After/Listing', {product: product, data: data}, function (){})
					$($.Gomag.config.listingAddToCart + product.id).removeClass($.Gomag.config.addToCartDisababled);


				}
				if(cartItems.getLocation() == 'd')
				{
					$.Gomag.trigger('Product/Add/To/Cart/After/Details', {product: product, data: data}, function (){})
					$($.Gomag.config.detailsAddToCart + product.id).removeClass($.Gomag.config.addToCartDisababled);
				}
			})
		},
		displayAddToCartPopup : function(response, data){

			$.Gomag.addToCartPopup.display(response, data);
		},
		isMaxQuantity : function(productId)
		{
			if($.Gomag.envData.products[productId] == undefined)
			{
				return false;
			}
			var product = $.Gomag.envData.products[productId];
			var quantity =  $($.Gomag.config.addToCartQuantityH + product.id).find($.Gomag.config.addToCartQuantity).val();

			var increaseQuantityValue = parseFloat(parseFloat(quantity).toFixed($.Gomag.productsStockDecimals) + parseFloat(product.stepQuantity).toFixed($.Gomag.productsStockDecimals)).toFixed($.Gomag.productsStockDecimals);

			var toCheckStock = parseFloat(product.stock).toFixed($.Gomag.productsStockDecimals);
			var toCheckStockStepQuantity = parseFloat(increaseQuantityValue) + parseFloat(product.stepQuantity);

			return parseFloat(toCheckStock) <= parseFloat(increaseQuantityValue) || parseFloat(toCheckStock) <= parseFloat(toCheckStockStepQuantity) ? true : false;


		},
		isMinQuantity : function(productId)
		{
			if($.Gomag.envData.products[productId] == undefined)
			{
				return false;
			}
			var product = $.Gomag.envData.products[productId];
			var quantity =  $($.Gomag.config.addToCartQuantityH + product.id).find($.Gomag.config.addToCartQuantity).val();
			var decreaseQuantityValue = parseFloat(parseFloat(quantity).toFixed($.Gomag.productsStockDecimals) - parseFloat(product.stepQuantity).toFixed($.Gomag.productsStockDecimals)).toFixed($.Gomag.productsStockDecimals);
			var minRuleQty = $.Gomag.getMinQuantityFromRules(product);
			var minQty = minRuleQty > 0 ? product.stepQuantity : product.orderMinimQuantity;
			var toCheckStock = parseFloat(minQty).toFixed($.Gomag.productsStockDecimals);

			return  (parseFloat(toCheckStock) > parseFloat(decreaseQuantityValue)
					||
					parseFloat(decreaseQuantityValue) == 0)
					?
						true
					:
						false;
		},
		increaseQuantity : function(productId)
		{

			if($.Gomag.envData.products[productId] == undefined)
			{
				return false;
			}
			var product = $.Gomag.envData.products[productId];
			var quantity =  $($.Gomag.config.addToCartQuantityH + product.id).find($.Gomag.config.addToCartQuantity).val();

			quantity = parseFloat(parseFloat(quantity) + product.stepQuantity).toFixed($.Gomag.productsStockDecimals);

			var element = $($.Gomag.config.addToCartQuantityH + product.id).find($.Gomag.config.addToCartQuantity);

			element.val(quantity);
			realQuantity = $.Gomag.getCartProductQuantity(productId);
			if(product.realStock != undefined && parseFloat(product.realStock) < parseFloat(realQuantity))
			{
				$($.Gomag.config.deliveryTimeClass).removeClass('hide');
			}

			if(realQuantity.indexOf(".") >= 0){
				realQuantity = realQuantity.replace(/0+$/g,'');
				realQuantity = realQuantity.replace(/\.$/g,'');
			}

			element.val(realQuantity);
			$.Gomag.trigger('Product/Quantity/Change');
			$.Gomag.setProductPriceForQuantity(product.id, realQuantity);

			return false;

		},
		decreaseQuantity : function(productId)
		{
			if($.Gomag.envData.products[productId] == undefined)
			{
				return false;
			}


			var product = $.Gomag.envData.products[productId];
			var quantity =  $($.Gomag.config.addToCartQuantityH + product.id).find($.Gomag.config.addToCartQuantity).val();

			quantity = parseFloat(parseFloat(quantity) - product.stepQuantity).toFixed($.Gomag.productsStockDecimals);

			if(quantity < parseFloat(product.orderMinimQuantity) || quantity <= 0)
			{
				quantity = parseFloat(product.orderMinimQuantity).toFixed($.Gomag.productsStockDecimals);
			}

			var element = $($.Gomag.config.addToCartQuantityH + product.id).find($.Gomag.config.addToCartQuantity);

			element.val(quantity);

			realQuantity = $.Gomag.getCartProductQuantity(productId)
			if(product.realStock != undefined && parseFloat(product.realStock) >= parseFloat(realQuantity) && $($.Gomag.config.deliveryTimeClass).hasClass('useOrderOption'))
			{
				$($.Gomag.config.deliveryTimeClass).addClass('hide');
			}
			if(realQuantity.indexOf(".") >= 0){
				realQuantity = realQuantity.replace(/0+$/g,'');
				realQuantity = realQuantity.replace(/\.$/g,'');
			}
			element.val(realQuantity);

			$.Gomag.trigger('Product/Quantity/Change');
			$.Gomag.setProductPriceForQuantity(product.id, realQuantity);
			return false;

		},

		/*add to cart*/
		transformEnvProducts: function(envProducts)
		{

			if(envProducts == undefined)
			{
				products = {};
			}
			else
			{
				envDataProducts = $.Gomag.envData.products;
				$.each(envProducts, function(i, v){
					var product = v;
					product.id = parseInt(v.id);
					product.price = parseFloat(v.price);
					product.basePrice = parseFloat(v.basePrice);
					product.stepQuantity = parseFloat(v.stepQuantity);
					product.stock = parseFloat(v.stock);
					product.orderMinimQuantity = parseFloat(v.orderMinimQuantity);
					envDataProducts[i] = product;
				});
				$.Gomag.envData.products = envDataProducts;

			}
		},
		setEnvData : function(envData)
		{
			if(envData != undefined)
			{
				$.Gomag.envData = $.Gomag.envData != undefined ? $.Gomag.envData : envData;
				$.Gomag.transformEnvProducts(envData.products);

			}
		},
		addCartTotalsToEnvData : function(subtotal= 0, total = 0)
		{
			if($.Gomag.envData != undefined && subtotal > 0)
			{
				$.Gomag.envData.cartSubtotal = parseFloat(subtotal);
			}
			if($.Gomag.envData != undefined && total > 0)
			{
				$.Gomag.envData.cartTotal = parseFloat(total);
			}
		},
		getEnvData : function()
		{
			if($.Gomag.envData != undefined)
			{
				return $.Gomag.envData;

			}
			return {};
		},
		fadeReplace: function($element, newContent, callback){
			var $newEl = $(newContent).css({opacity: 0, visibility: 'hidden'});
			$element.empty().append($newEl);

			$newEl.css('visibility','visible').animate({opacity: 1}, 500, function(){
				if (typeof callback === 'function') callback($newEl);
			});
		},
		productChangeVersion: function(data)
		{
			if(data.product != data.version || ($.Gomag.settings.doNotSelectVersion != undefined && $.Gomag.settings.doNotSelectVersion === true) || data.nocache !== undefined) {
				$.Gomag.trigger('Product/Disable/AddToCart');
				$.Gomag.trigger('Product/Details/Before/Ajax/Load');

				$.get($.Gomag.ajaxLoadProductDetails, {product:data.version, type: data.type !== undefined ? data.type : 'product', data:data}, function(response){

					$($.Gomag.config.detailsProductPackageBox).remove();
					var detailsProductRowBox =  $($.Gomag.config.detailsProductRowBox).clone();
					$.Gomag.trigger('Product/Details/After/Ajax/Response', {data: data, response: response});

					$('.'+$.Gomag.config.detailsProductBoxClassNamePrefix + data.product).addClass($.Gomag.config.detailsProductBoxClassNamePrefix + data.version);
					if(data.version != data.product)
					{
						$('.'+$.Gomag.config.detailsProductBoxClassNamePrefix + data.product).removeClass($.Gomag.config.detailsProductBoxClassNamePrefix + data.product);
					}
					$('.'+$.Gomag.config.detailsProductBoxClassNamePrefix+data.version).attr("data-product-id", data.version);
					$.Gomag.trigger('Product/Preview/After/Ajax/Load', detailsProductRowBox);
					$.Gomag.addWidgetTrigger();


					if(response.packages) {
						if($($.Gomag.config.detailsProductTop).find('.product-top.'+$.Gomag.config.detailsProductBoxClassNamePrefix+data.version).length) {
							$('.container-h '+$.Gomag.config.detailsProductPage).prepend(response.packages);
						} else {
							$($.Gomag.config.detailsProductPage).find('.product-top.'+$.Gomag.config.detailsProductBoxClassNamePrefix+data.version).after(response.packages);
						}

						if($($GomagConfig.detailsProductPackageBox).find(".slide-item-4").length)
						{
							$($GomagConfig.detailsProductPackageBox).find('.slide-item-4').each(function(){

								$(this).owlCarousel({items:4,navigation:!0,pagination:!1,itemsCustom : [[0, 2],[767, 3],[1000, 4]]});
							});
						}

						if($($GomagConfig.detailsProductPackageBox).find(".slide-item-2").length)
						{
							$($GomagConfig.detailsProductPackageBox).find('.slide-item-2').each(function(){

								$(this).owlCarousel({items:4,navigation:!0,pagination:!1,itemsCustom : [[0, 2],[767, 3],[1000, 4]]});
							});
						}
					}
					$.Gomag.buildProductsForDataRequest();

				},'json');
			}
		},
		initOrderSummartyUpdate:  function(data, forceAjaxRun)
		{

			$('#doCheckout').addClass('-g-checkout-submit-disabled');
			orderSummary.setData(data, 'init');
			if($.Gomag.sameSummaryData(orderSummary.getPropertiesForInit()) && (forceAjaxRun == undefined || !forceAjaxRun))
			{
				$('#doCheckout').removeClass('-g-checkout-submit-disabled');
				return false;
			}
			$.Gomag.lastSummaryDataRequest = orderSummary.getPropertiesForInit();

			$.Gomag.ajax($.Gomag.orderSummaryUrl ? $.Gomag.orderSummaryUrl : orderSummary.orderSummaryUrl, orderSummary.getPropertiesForInit(), 'GET', $.Gomag.completeOrderSummaryUpdate, 'responseJSON');


		},
		initQuickOrderSummartyUpdate:  function(data, quickOrderSummaryUrl)
		{

			if(quickOrderSummaryUrl)
			{
				$('#__saveOrder').addClass('-g-checkout-submit-disabled');
				orderSummary.setData(data, 'init');

				if($.Gomag.sameSummaryData(orderSummary.getPropertiesForInit()))
				{
					$('#__saveOrder').removeClass('-g-checkout-submit-disabled');
					return false;
				}

				$.Gomag.lastSummaryDataRequest = orderSummary.getPropertiesForInit();

				$.Gomag.ajax(quickOrderSummaryUrl, orderSummary.getPropertiesForInit(), 'GET', $.Gomag.completeOrderSummaryUpdate, 'responseJSON');
			}

			return false;

		},
		sameSummaryData:  function(data)
		{
			var oldData = $.Gomag.lastSummaryDataRequest;

			if(!oldData || oldData == undefined)
			{
				return false;
			}
			return $.Gomag.objectDiffExists(oldData, data);

		},
		objectDiffExists:  function(obj1, obj2)
		{

			var diff = true;

		   for (var k in obj1) {
			  if (!(k in obj2))
				 diff = false;
			  else if (obj1[k] !== obj2[k])
				  diff = false;
		   }

		   for (k in obj2) {
			  if (!(k in obj1))
				  diff = false;
		   }
			return diff;

		},
		completeOrderSummaryUpdate: function(data)
		{
			orderSummary.setData(data, 'complete');

			if(data != undefined && data.cartTotal !== undefined && data.cartSubtotal != undefined ){
				$.Gomag.addCartTotalsToEnvData(data.cartSubtotal, data.cartTotal);
			}


			var properties = orderSummary.getProperties();
			$.Gomag.trigger('Order/Summary/Complete', {'properties': properties});
		},
		addToWishlist: function(data)
		{

			if(data == undefined || $.Gomag.envData.products[data.p] == undefined)
			{
				return false;
			}

			$($.Gomag.config.addToWishlistPopupProductName).html($.Gomag.envData.products[data.p].name.replace("\\\'", "\'"));
			$.post(data.u, function(responseData) {
				data.action = responseData.action != undefined ? responseData.action : 'add';
				$.Gomag.trigger('User/Data/Response',responseData);
				if(responseData.action != undefined && responseData.action == 'remove')
				{
					if($($.Gomag.config.detailsAddToWishlist+data.p).length){

						$($.Gomag.config.detailsAddToWishlist+data.p).removeClass('-g-added-to-wishlist');
					}

					if($($.Gomag.config.listingAddToWishlistGeneral+data.p).length){

						$($.Gomag.config.listingAddToWishlistGeneral+data.p).removeClass('-g-added-to-wishlist');
					}
				}
				else
				{
					if($($.Gomag.config.detailsAddToWishlist+data.p).length){

						$($.Gomag.config.detailsAddToWishlist+data.p).addClass('-g-added-to-wishlist');
					}

					if($($.Gomag.config.listingAddToWishlistGeneral+data.p).length){

						$($.Gomag.config.listingAddToWishlistGeneral+data.p).addClass('-g-added-to-wishlist');
					}
				}

				var product = $.Gomag.envData.products[data.p] != undefined ? $.Gomag.envData.products[data.p] : {};

				$.Gomag.trigger('Product/Add/To/Wishlist/After',{product: product, data: data});
			}, 'json');

		},
		triggerDOMChange: function()
		{

			var DOMContentLoaded_event = document.createEvent("Event");
			DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
			window.document.dispatchEvent(DOMContentLoaded_event);

		},
		secureForms: function()
		{
			if($.Gomag.secureFormsValues['isSecure'] === false)
			{
				return false;
			}
			if($.Gomag.secureFormsValues['name'] == undefined || !$.Gomag.secureFormsValues['name'] || $.Gomag.secureFormsValues['value'] == undefined || !$.Gomag.secureFormsValues['value'])
			{
				return false;
			}
			if($('form input.-g-secureForm').length){
				$('form input.-g-secureForm').remove();
			}
			$('form').each(function(){
				if($(this).attr('method') == 'post')
				{
					$(this).append('<input type="hidden" class="-g-secureForm" name="'+$.Gomag.secureFormsValues['name']+'" value="'+$.Gomag.secureFormsValues['value']+'" />');
				}
			})
		},
		eqProductRow: function()
		{
			clearTimeout(tmToStartCalc);
			tmToStartCalc = setTimeout(function(){
				var caroSlidBox = $('.carousel-slide .product-box'),
					caroSlid = $('.carousel-slide'),
					categHBox = $('.product-listing .product-box, .product-list .product-box'),
					categH = $('.product-listing, .product-list'),
					setIntForSlideLenght = '',
					caroItemH = 0;
				// if we detect carousel list of items
				if(caroSlidBox.length){
					setIntForSlideLenght = setInterval(function(){
						if(caroSlid.find('.owl-wrapper').length){
							caroSlid.each(function(e_parent){
								caroItemH = 0;
								var thisCarolusel = $(this);
									thisCarolusel.find('.figcaption').removeAttr('style');
									thisCarolusel.find('.figcaption').each(function(e_child) {
										caroItemH = Math.max(caroItemH, $(this).outerHeight());
									}).height(caroItemH).addClass('owl-f');
							});
							clearInterval(setIntForSlideLenght);
						}
					},200);
				};
				// if we detect category list of items
				if(categHBox.length){
					categH.each(function(e){
						caroItemH = 0;
						var categItemsPar = $(this);
						categItemsPar.find('.figcaption').removeAttr('style');
						categItemsPar.find('.figcaption').each(function(e){
							caroItemH = Math.max(caroItemH, $(this).outerHeight());
						}).height(caroItemH).addClass('list-f');
					});
				};
			},400); // put a simple delay, just in case for other function that are running before this one like resize function
		},
		getEnviromentItem: function(productId)
		{
			if(productId === undefined || $.Gomag.envData.products[productId] === undefined)
			{
				return {};
			}
			else
			{
				return $.Gomag.envData.products[productId];
			}
		},
		displayCategoryIconInMenu: function()
		{
			$('a[data-block="mainMenuD"]').each(function(){
				if($(this).attr('data-gomag') != ''){
					var dataGomag = JSON.parse($(this).attr('data-Gomag'));
					if(dataGomag.image != undefined && dataGomag.image != ''){
						$(this).prepend('<img src="'+dataGomag.image+'" style="display:inline-block;height: 22px;    width: 16px;margin-right: 8px;vertical-align: bottom;">');
					}
				}
			});
		},
		asyncClick: function(event, data, url)
		{

			if(event == undefined)
			{
				if(url && url != undefined){
					window.location = url;
				}
				else
				{
					return false;
				}
			}

			asyncQueue = new asyncClickTrigger();
			asyncQueue.setData(data);
			asyncQueue.setUrl(url);
			asyncQueue.setQueueList([]);

			$.Gomag.triggerAsync(event, data, asyncQueue);
			$.Gomag.asyncClickRun(asyncQueue);
		},
		asyncClickComplete: function(queue)
		{
			queue.setCompleteOne();
			$.Gomag.asyncClickRun(queue);
		},
		asyncClickBlock: function(queue)
		{
			queue.setBlockOne();
		},
		asyncClickRun: function(queue)
		{
			if(queue.allEventsDone() && queue.getUrl())
			{
				window.location = queue.getUrl();
			}
			return false;
		},
		isJson: function(string)
		{
			try {
				JSON.parse(string);
			} catch (e) {
				return false;
			}
			return true;
		},
		parseCheckoutFormCheckResponse: function(data)
		{
			$.Gomag.submitCheckoutForm = true;
			$('.-g-orderCheckout-errors').addClass('hide');
			if(!$.isPlainObject(data) || !data.error)
			{
				$.Gomag.submitCheckoutForm = true;
			}
			else if (data.error && data.errors == undefined)
			{
				$.Gomag.submitCheckoutForm = true;
			}
			else if(data.error && data.errors != undefined)
			{
				if(data.errors['minimorder'] && !data.errors['email'])
				{
					data.errors['email'] = data.errors['minimorder'];
				}
				if(data.errors['shipping_city'])
				{
					data.errors['shipping_city_name'] = 1;
				}
				if(data.errors['billing_city'])
				{
					data.errors['billing_city_name'] = 1;
				}
				if(data.errors['shipping_region'])
				{
					data.errors['shipping_region_name'] = 1;
				}
				if(data.errors['billing_region'])
				{
					data.errors['billing_region_name'] = 1;
				}
				$.each(data.errors, function(i, v){
					var element = $('#checkoutform').find('[name="'+i+'"]');

					if(v)
					{
						element.addClass('err-input');
						element.siblings('label.label-s').addClass('err-text');
						if(i == 'email')
						{

							if(v == 1)
							{
								element.siblings('span.emailError1').removeClass('hide');
								element.siblings('span.emailError2').addClass('hide');
								element.siblings('span.emailError3').addClass('hide');
							}
							else
							{
								if(v == 2)
								{
									element.siblings('span.emailError1').addClass('hide');
									element.siblings('span.emailError2').removeClass('hide');
									element.siblings('span.emailError3').addClass('hide');

								}
								else
								{
									element.siblings('span.emailError1').addClass('hide');
									element.siblings('span.emailError2').addClass('hide');
									element.siblings('span.emailError3').removeClass('hide');
								}
							}
						}else if(i == 'phone')
						{

							if(v == 1)
							{
								element.siblings('span.errorPhone1').removeClass('hide');
								element.siblings('span.errorPhone2').addClass('hide');
							}
							else
							{
								element.siblings('span.errorPhone1').addClass('hide');
								element.siblings('span.errorPhone2').removeClass('hide');
							}
						}
						else
						{
							if(i == 'shipping_zipcode_street')
							{
								element.val('');
							}
							element.siblings('span.hint-order').removeClass('hide');
						}
					}
					else
					{
						element.removeClass('err-input');
						element.siblings('label.label-s').removeClass('err-text');
						element.siblings('span.hint-order').addClass('hide');

					}
				});

				$.Gomag.trigger('Checkout/Form/Check/Response/After', {checkout: data});

				var $firstErr = $("label.label-s.err-text").first();
				if ($firstErr.length) {
					$('html, body').animate({
						scrollTop: $firstErr.offset().top
					}, 1000);
				}
				$('.-g-orderCheckout-errors').removeClass('hide');
				$.Gomag.submitCheckoutForm = false;
			}
		},
		checkoutFormCheck: function()
		{
			if(!$.Gomag.settings.ajaxCheckoutCheck)
			{
				$.Gomag.submitCheckoutForm = true;
			}
			else
			{

				var data = $($.Gomag.config.checkoutForm).serialize();
				$.Gomag.ajax($.Gomag.orderCkeckoutValidUrl, data, 'POST', $.Gomag.parseCheckoutFormCheckResponse,'responseJSON', false);
			}
			return $.Gomag.submitCheckoutForm;
		},
		/*Local Sotrage*/
		getInfoForLocalStorage: function()
		{
			var lsValues = {};
			if($($GomagConfig.localStorageClassName).length)
			{
				$($GomagConfig.localStorageClassName).each(function(){
					var element = $(this);
					var name = $(this).attr('name');
					var value = '';
					if(element.is('input') && (element.attr('type') == 'radio' || element.attr('type') == 'checkbox'))
					{
						if(element.is(':checked')){
							value = $(this).val();
						}
					}
					else
					{
						value = $(this).val();
					}

					if(name && value)
					{
						lsValues[name] = value;
					}
				})
			}
			return lsValues;
		},
		updateFieldsFromLocalStorage: function(name)
		{

			if (typeof(Storage) == "undefined") {
				return false;
			}
			var info = $.Gomag.getLocalStorage(name);
			if(!info)
			{
				return false;
			}
			$.each(info, function(i, v){
				if($('[name="'+i+'"]').length){
					var element = $('[name="'+i+'"]');
					if(element.is('input') && (element.attr('type') == 'radio' || element.attr('type') == 'checkbox'))
					{
						$('[name="'+i+'"]').each(function(){
							if(v == $(this).val())
							{
								$(this).prop('checked', true);
							}
						})

					}
					else
					{
						$('[name="'+i+'"]').val(v);
					}

				}
			});
			$($GomagConfig.localStorageClassName).trigger('change');
			$.Gomag.trigger('Local/Storage/Update/After');
			return false;
		},
		getLocalStorage: function(name)
		{
			value = localStorage.getItem('gomag'+name);
			if(!value || value == undefined)
			{
				return [];
			}
			else
			{
				return JSON.parse(value);
			}
			//return localStorage.getItem('gomag'+name);
		},
		setLocalStorage: function(name, value)
		{
			if(!value || value == undefined || value.length)
			{
				return false;
			}
			localStorage.setItem('gomag'+name, JSON.stringify(value));
		},
		updateLocalStorage: function(name)
		{
			if (typeof(Storage) == "undefined") {
				return false;
			}
			$.Gomag.setLocalStorage(name, $.Gomag.getInfoForLocalStorage());
		},
		removeLocalStorage: function(name)
		{
			if (typeof(Storage) == "undefined") {
				return false;
			}
			localStorage.removeItem('gomag'+name);
		},
		scrollToComponent: function(selector) {
			if($(selector).length){
				var header = $('.main-header');
				$([document.documentElement, document.body])
					.stop(true)
					.animate({
						scrollTop: $(selector).offset().top - 100 - header.height()
					}, 600, 'swing');
			}
		},
		refreshComponent: function(settings)
		{
			$.Gomag.ajax($.Gomag.ajaxComponentsReload, {componentId: settings.componentId, preview: 1}, 'get', function(data){
				var loaderExists = $('.-g-div-blank-component').length;
				if(loaderExists){
					$.Gomag.removeBlankComponent();
				}
				if($($.Gomag.config.componentsSelectByIdClass+data.componentId).length)
				{
					$(data.template).find('img[loading]').removeAttr('loading');

					$($.Gomag.config.componentsSelectByIdClass + data.componentId).fadeOut(100, function () {
						$($.Gomag.config.componentsSelectByIdClass + data.componentId).replaceWith(data.template).fadeIn(100);
					});
				}
				else if(settings.insertComponentAfterId != undefined && settings.insertComponentAfterId)
				{
					$($.Gomag.config.componentsSelectByIdClass+settings.insertComponentAfterId).after(data.template);
					if (window !== window.parent) {
						parent.selectComponent(data.componentId);
						parent.postMessage({type: 'componentSaved', componentId: data.componentId}, '*');
					}
				}
				else if($('.gomagComponent[data-gomag-component]').length)
				{
					$('.gomagComponent[data-gomag-component]').last().after(data.template);
					if (window !== window.parent) {
						parent.selectComponent(data.componentId);
						parent.postMessage({type: 'componentSaved', componentId: data.componentId}, '*');
					}
				}
				else
				{
					$('.__pageComponentsHolder').append(data.template);
					if (window !== window.parent) {
						parent.selectComponent(data.componentId);
						parent.postMessage({type: 'componentSaved', componentId: data.componentId}, '*');
					}
				}
				setTimeout(function() {
					if($($.Gomag.config.componentsSelectByIdClass+data.componentId).find('.slide-item-component:not(.owl-carousel)')){
						const configs = {
							6: [[0,2],[479,2],[768,3],[979,3],[1099,4],[1199,5],[1299,6]],
							5: [[0,2],[479,2],[768,3],[979,3],[1199,4],[1299,5]],
							4: [[0,2],[479,2],[768,3],[979,3],[1199,4]],
							3: [[0,2],[479,2],[768,2],[979,3],[1199,3]],
							2: [[0,2],[479,2],[768,2],[979,2],[1199,2]],
							1: [[0,2],[479,2],[768,2],[979,3],[1091,1],[1199,1]],
						};

						$.each(configs, function(count, itemsCustom){
							$($.Gomag.config.componentsSelectByIdClass+data.componentId).find(".slide-item-" + count).owlCarousel({
								items: parseInt(count),
								navigation: true,
								pagination: true,
								itemsCustom: itemsCustom
							});
						});
					}
					if($($.Gomag.config.componentsSelectByIdClass+data.componentId).hasClass('soon')){
						$($.Gomag.config.componentsSelectByIdClass+data.componentId).soon().create();
					}
					if($($.Gomag.config.componentsSelectByIdClass+data.componentId).hasClass('wordpress-articles-h')){
						$($.Gomag.config.componentsSelectByIdClass+data.componentId).find('.slide-general-3').owlCarousel({
							items: 3,
							navigation:true,
							pagination:true,
							itemsCustom : [
								[0,1],[479,2],[768,2],[979,3],[1199,3]
							]
						});

						$($.Gomag.config.componentsSelectByIdClass+data.componentId).find('.slide-general-2').owlCarousel({
							items: 2,
							navigation:true,
							pagination:true,
							itemsCustom : [
								[0,1],[479,2],[768,2],[979,2],[1199,2]
							]
						});
					}
				}, 200);
				if (window !== window.parent) {
					setTimeout(function() {
						parent.highlightResize();
					}, 400);
				}

			}, 'responseJSON');
		},
		sortComponents: function(settings)
		{
			if(!$($.Gomag.config.componentsSelectByIdClass+settings.componentId).length || !$($.Gomag.config.componentsSelectByIdClass+settings.prevElement).length)
			{
				return false;
			}
			var element = $($.Gomag.config.componentsSelectByIdClass+settings.componentId)[0].outerHTML;
			$($.Gomag.config.componentsSelectByIdClass+settings.componentId).remove();
			if(settings.index == 0)
			{
				$($.Gomag.config.componentsSelectByIdClass+settings.prevElement).before(element);
			}
			else
			{
				$($.Gomag.config.componentsSelectByIdClass+settings.prevElement).after(element);
			}
			$.Gomag.scrollToComponent($.Gomag.config.componentsSelectByIdClass+settings.componentId);

			if (window !== window.parent) {
				setTimeout(function() {
					parent.highlightResize();
				}, 400);
			}
		},
		removeComponent: function(settings)
		{
			if($($.Gomag.config.componentsSelectByIdClass+settings.componentId).length)
			{
				$($.Gomag.config.componentsSelectByIdClass+settings.componentId).remove();
			}
			if (window !== window.parent) {
				setTimeout(function() {
					parent.highlightResize();
				}, 400);
			}
		},
		addComponentLoader: function(settings)
		{
			if($($.Gomag.config.componentsSelectByIdClass+settings.componentId).length)
			{
				$($.Gomag.config.componentsSelectByIdClass+settings.componentId).addClass('-g-div-loading-component');
			}
		},
		addBlankComponent: function()
		{
			if($('.gomagComponent[data-gomag-component]').length){
				$('.gomagComponent[data-gomag-component]').last().after('<div class="-g-div-loading-component container-bg  container-h -g-div-blank-component" style="display: block; height: 150px;"></div>');
			} else {
				$('.__pageComponentsHolder').append('<div class="-g-div-loading-component container-bg  container-h -g-div-blank-component" style="display: block; height: 150px;"></div>');
			}
			$.Gomag.scrollToComponent('.-g-div-blank-component');
		},
		addBlankComponentAfter: function(settings)
		{
			$($.Gomag.config.componentsSelectByIdClass+settings.insertComponentAfterId).after('<div class="-g-div-loading-component container-bg  container-h -g-div-blank-component" style="display: block; height: 150px;"></div>');
			$.Gomag.scrollToComponent('.-g-div-blank-component');
		},
		removeBlankComponent: function()
		{
			$('.-g-div-blank-component').remove();
		},
		reloadComponent: function(settings)
		{
			if(settings.reloadComponent != undefined && settings.reloadComponent && settings.componentId != undefined && settings.componentId)
			{
				$.Gomag.refreshComponent(settings);
			}
			if(settings.sortElements != undefined && settings.sortElements)
			{
				$.Gomag.sortComponents(settings);
			}
			if(settings.removeComponent != undefined && settings.removeComponent && settings.componentId != undefined && settings.componentId)
			{
				$.Gomag.removeComponent(settings);
			}
			if(settings.addLoader != undefined && settings.addLoader && settings.componentId != undefined && settings.componentId)
			{
				$.Gomag.addComponentLoader(settings);

			}
			if(settings.scrollToComponent != undefined && settings.scrollToComponent && settings.componentId != undefined && settings.componentId)
			{
				$.Gomag.scrollToComponent($.Gomag.config.componentsSelectByIdClass+settings.componentId);
			}
			if(settings.addBlankComponent != undefined && settings.addBlankComponent)
			{
				if(!$('.-g-div-blank-component').length){
					$.Gomag.addBlankComponent();
				}
			}
			if(settings.insertComponentAfterId != undefined && settings.insertComponentAfterId)
			{
				if(!$('.-g-div-blank-component').length){
					$.Gomag.addBlankComponentAfter(settings);
				}
			}
		},
		displayCartRecoveryPopupInOrder: function(element)
		{
			var display = true;

			if(
				!$.Gomag.environment
				||
				!$.Gomag.orderUrl
				||
				!$.Gomag.orderCheckoutUrl
				||
				(
					$.Gomag.environment['Page/Order'] == undefined
					&&
					$.Gomag.environment['Page/OrderCheckout'] == undefined
				)
				||
				element.attr('href') == $.Gomag.orderUrl
				||
				element.attr('href') == $.Gomag.orderCheckoutUrl
				||
				!element.attr('href').startsWith('http')
				||
				widgets['popup:onexit'] == undefined
			)
			{
				display = false;
			}
			return display;
		},
		/*cart voucher*/
		getParameterByName : function(name, url){
			name = name.replace(/[\[\]]/g, '\\$&');
			var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';

			let value = results[2];
			value = value.replace(/%/g, '-g-percent-voucher');

			let data = decodeURIComponent(value.replace(/\+/g, ' '));
			return data.replace(/-g-percent-voucher/g, '%');
		},
		setCartVoucher: function(voucher){
			if(voucher != undefined && voucher != null && voucher)
			{
				$.Gomag.ajax($.Gomag.addToCartUrl, {voucher: voucher}, 'POST');
			}
		},
		addCartVoucher: function(){
			var voucher =$.Gomag.getParameterByName('voucher',  window.location.href);
			if(voucher != undefined && voucher != null && voucher)
			{
				$.Gomag.setCartVoucher(voucher);
			}
		},
		numberFormatPrice: function (price) {
			price += '';
			var x = price.split('.');
			var x1 = x[0];
			var x2 = x.length > 1 ? ',' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
			  x1 = x1.replace(rgx, '$1' + '.' + '$2');
			}
			return x1 + x2;
		},
		applyPriceDisplayFilter: function(price) {
			var filter = $.Gomag.settings && $.Gomag.settings.productPriceDisplayFilter ? $.Gomag.settings.productPriceDisplayFilter : '';
			switch(filter) {
				case 'displayPriceRound':
					return Math.round(price).toFixed(0);
				case 'displayPriceRoundCeil':
					return Math.ceil(price).toFixed(0);
				case 'displayPriceRoundFloor':
					return Math.floor(price).toFixed(0);
				case 'displayPriceRoundOrDecimals':
					return Math.floor(price) === price ? price.toFixed(0) : price.toFixed(2);
				case 'displayPriceWithTreeDecimals':
					return price.toFixed(3);
				case 'displayPriceWithFourDecimals':
					return price.toFixed(4);
				case 'displayNinetyNinePercent':
					return (Math.floor(price) + 0.99).toFixed(2);
				default:
					return price.toFixed(2);
			}
		},


		/*cart voucher*/
		setLanguages : function(){
			var languages = $.Gomag.languages;

			if(languages != undefined && languages != false && Object.keys(languages).length > 1)
			{
				$.each(languages, function(i, v){
					$('a.text-default[data-lang='+i+']').attr('href', v.redirectUrl);
				})
			}
		},
		setCurrencies : function(){
			var currencies = $.Gomag.currencies;

			if(currencies != undefined && currencies != false && Object.keys(currencies).length > 1)
			{
				$.each(currencies, function(i, v){
					$('a.currencyList[data-id='+i+']').attr('href', v.url);
					if(v.selected == '1')
					{
						$('.-g-currency-display').html(v.name)
					}
				})
			}
		},
		setCID: function(value){
			$.Gomag.CID = value;
		},
		getCID: function(){
			return $.Gomag.CID;
		},
		orderCheckoutFinalize: function(){
			if($.Gomag.settings.saveOrderUsingAjax)
			{
				var data = new FormData();

				//Form data
				var form_data = $($.Gomag.config.checkoutForm).serializeArray();
				$.each(form_data, function (key, input) {
					data.append(input.name, input.value);
				});

				if($('input.inputFile').length){
					//File data
					var file_data = $('input.inputFile')[0].files;
					for (var i = 0; i < file_data.length; i++) {
						data.append("files[]", file_data[i]);
					}
				}
				$.Gomag.ajax($.Gomag.orderCkeckoutSaveUrl, data, 'POST', function(data) {
					$.Gomag.orderCheckoutFinalizeResponse(data);
				}, 'responseJSON', true, 0);
				//$.Gomag.ajax($.Gomag.orderCkeckoutSaveUrl, $($.Gomag.config.checkoutForm).serialize(), 'POST', $.Gomag.orderCheckoutFinalizeResponse,'responseJSON', false);
			}
			else
			{
					$($.Gomag.config.checkoutForm).submit();
			}

		},
		orderCheckoutFinalizeResponse: function(data){
			$.Gomag.trigger('Order/Checkout/Finalize/Before/Redirect', {data: data}, false, data.callbackName);
			if((data.callbackName == undefined || !data.callbackName) && data.redirectUrl != undefined)
			{
				let redirectUrl = data.redirectUrl;
				if(redirectUrl.indexOf($.Gomag.mainDomain) !== -1 || !($.Gomag.mainDomain))
				{
					window.location.replace(data.redirectUrl);
				}
			}
			$.Gomag.trigger('Order/Checkout/Finalize', {data: data}, false, data.callbackName);
		},
		isEmail: function(email)
		{
			var pattern = new RegExp(/^([0-9\p{L}\+_\-]+)(\.[0-9\p{L}\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,}$/, "ui");
			// var pattern = new RegExp(/^[a-zA-Z0-9_\-\+\u0400-\u04FF](\.?[a-zA-Z0-9_\-\+\u0400-\u04FF]+)*[@][a-zA-Z0-9\-\.\u0400-\u04FF]+(\.[a-zA-Z\u0400-\u04FF]{2,})+$/);

			return pattern.test(email);
		},
		isName: function(name)
		{
			var pattern = new RegExp(/^[a-zA-Z\u0400-\u04FF\u00C0-\u024F\u1E00-\u1EFF ,.'-]+$/);
				return pattern.test(name);
		},
		isPhone: function(phone, country)
		{
			var isValidPhoneNumber = 0;
			$.Gomag.ajax(
				$.Gomag.checkPhoneNumberUrl,
				{phone: phone, country: country},
				'POST',
				function(data){ isValidPhoneNumber = data.isValid },
				'responseJSON',
				false
			);

			return isValidPhoneNumber;
			/*
			var countriesLength = $.Gomag.getSettingsValue('phoneLengthsByCountry');

			if(false === country || undefined === country || countriesLength[country] == undefined)
			{
				var pattern = new RegExp(/^[0-9\-\+\.\ ]+$/);
				return phone.length >= 9 && pattern.test(phone);

			}
			else
			{
				var pattern1 = new RegExp(/^[0-9\-\+\.\ ]+$/);
				var pattern2 = new RegExp('^[0-9]{'+(countriesLength[country])+'}$');
				var phoneReplaced = phone.replace(/ /g, '');

				return pattern1.test(phone) && pattern2.test(phoneReplaced.replace(/[^0-9]/));

			}
			*/

		},
		isCheckoutEmailValid: function(){

			if($.Gomag.getSettingsValue('orderCheckoutEmailNotRequired') === true)
			{
				return true;
			}

			var isValid = ($('input[name="email"]').not('#_loginEmail').val() && $.Gomag.isEmail($.trim($('input[name="email"]').not('#_loginEmail').val()))) || !$('input[name="email"]').not('#_loginEmail').val();
			if(!isValid)
			{
				$('.emailError1').removeClass('hide');
				$('input[name="email"]').not('#_loginEmail').addClass('err-input');
				$('input[name="email"]').not('#_loginEmail').siblings('label').addClass('err-text');
			}
			else
			{
				$('.emailError1').addClass('hide');
				$('input[name="email"]').not('#_loginEmail').removeClass('err-input');
				$('input[name="email"]').not('#_loginEmail').siblings('label').removeClass('err-text');
			}
			return isValid;
		},

		isCheckoutPhoneValid: function(){
			if($.Gomag.getSettingsValue('orderCheckoutPhoneNotRequired') === true)
			{
				return true;
			}
			var isValid = $.Gomag.isPhone($.trim($('input[name="phone"]').val()), $('#_shippingCountry').length ? $('#_shippingCountry').val() : $('#_billingCountry').val());

			if(!isValid)
			{
				if(!$('input[name="phone"]').val())
				{
					$('.errorPhone1').removeClass('hide');
				}
				else
				{
					$('.errorPhone2').removeClass('hide');
				}

				$('input[name="phone"]').addClass('err-input');
				$('input[name="phone"]').siblings('label').addClass('err-text');
			}
			else
			{
				$('.errorPhone1').addClass('hide');
				$('.errorPhone2').addClass('hide');
				$('input[name="phone"]').removeClass('err-input');
				$('input[name="phone"]').siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isCheckoutShippingPhoneValid: function() {

			var isValid = !$($.Gomag.config.checkoutChangeShippingContact).is(':checked') ? 1 : $.Gomag.isPhone($.trim($('input[name="shipping_phone"]').val()), $('#_shippingCountry').val());

			if(!isValid)
			{
				if(!$('input[name="shipping_phone"]').val())
				{
					$('.errorShippingPhone1').removeClass('hide');
				}
				else
				{
					$('.errorShippingPhone2').removeClass('hide');
				}

				$('input[name="shipping_phone"]').addClass('err-input');
				$('input[name="shipping_phone"]').siblings('label').addClass('err-text');
			}
			else
			{
				$('.errorShippingPhone1').addClass('hide');
				$('.errorShippingPhone2').addClass('hide');
				$('input[name="shipping_phone"]').removeClass('err-input');
				$('input[name="shipping_phone"]').siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isCheckoutLastNameValid: function(){
			var $field = $('input[name="lastname"]');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length &&  $field.is(':visible') ? (!isEmpty && isValidChars) : true;
			if(!isValid)
			{
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			}
			else
			{
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isShippingLastNameUsed: function(){
			return $('input[name="shipping_lastname"]').length && !$('.differentShippingContact.hide input[name="shipping_lastname"]').length && $('input[name="shipping_lastname"]').is(':visible');
		},
		isCheckoutShippingLastNameValid: function(){
			if(!$.Gomag.isShippingLastNameUsed()){
				return true;
			}
			var $field = $('input[name="shipping_lastname"]');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length  ? (!isEmpty && isValidChars) : true;
			if(!isValid)
			{
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			}
			else
			{
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isCheckoutFirstNameValid: function(){

			var $field = $('input[name="firstname"]');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length && $field.is(':visible') ? (!isEmpty && isValidChars) : true;
			if(!isValid)
			{
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			}
			else
			{
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},

		isCheckoutCnpValid: function(canBeEmpty){
			var cnpValue = $.trim($('input[name="personal_number"]').val());
			var isValid = $('input[name="personal_number"]').length ? (cnpValue.length == 13 && /^\d{13}$/.test(cnpValue)) ||(canBeEmpty && cnpValue.length == 0) : true;

			if(!isValid)
			{
				$('input[name="personal_number"]').siblings('.hint-order').removeClass('hide');
				$('input[name="personal_number"]').addClass('err-input');
				$('input[name="personal_number"]').siblings('label').addClass('err-text');
			}
			else
			{
				$('input[name="personal_number"]').siblings('.hint-order').addClass('hide');
				$('input[name="personal_number"]').removeClass('err-input');
				$('input[name="personal_number"]').siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isShippingFirstnameUsed: function(){
			return $('input[name="shipping_firstname"]').length && !$('.differentShippingContact.hide input[name="shipping_firstname"]').length && $('input[name="shipping_firstname"]').is(':visible');
		},
		isCheckoutShippingFirstNameValid: function(){
			if(!$.Gomag.isShippingFirstnameUsed()){
				return true;
			}

			var $field = $('input[name="shipping_firstname"]');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length ? (!isEmpty && isValidChars) : true;
			if(!isValid)
			{
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			}
			else
			{
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isBillingLastNameUsed: function(){
			return $('.changeBillingAddress[name="change_billing_address"]').is(':checked') && $('input[name="billing_lastname"]').is(':visible');
		},
		isCheckoutBillingLastNameValid: function(){
			if(!$.Gomag.isBillingLastNameUsed()){
				return true;
			}
			var $field = $('input[name="billing_lastname"]');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length ? (!isEmpty && isValidChars) : true;
			if(!isValid)
			{
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			}
			else
			{
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isBillingFirstNameUsed: function(){
			return $('.changeBillingAddress[name="change_billing_address"]').is(':checked') && $('input[name="billing_firstname"]').is(':visible');
		},
		isCheckoutBillingFirstNameValid: function(){
			if(!$.Gomag.isBillingFirstNameUsed()){
				return true;
			}
			var $field = $('input[name="billing_firstname"]');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length ? (!isEmpty && isValidChars) : true;
			if(!isValid)
			{
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			}
			else
			{
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isCheckoutCombinedLastnameFirstnameValid: function(){
			var $field = $('input[name="lastnamefirstname"]').not('.differentShippingContact.hide input');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length && $field.is(':visible') ? (!isEmpty && isValidChars) : true;
			if(!isValid) {
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			} else {
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		isCheckoutShippingCombinedLastnameFirstnameValid: function(){
			var $field = $('input[name="shipping_lastnamefirstname"]').not('.differentShippingContact.hide input');
			var value = $.trim($field.val());
			var isEmpty = value.length === 0;
			var isValidChars = $.Gomag.isName(value);
			var isValid = $field.length && $field.is(':visible') ? (!isEmpty && isValidChars) : true;
			if(!isValid) {
				$field.siblings('.hint-order').addClass('hide');
				if(isEmpty) {
					$field.siblings('.hint-order').first().removeClass('hide');
				} else {
					$field.siblings('.hint-order').last().removeClass('hide');
				}
				$field.addClass('err-input');
				$field.siblings('label').addClass('err-text');
			} else {
				$field.siblings('.hint-order').addClass('hide');
				$field.removeClass('err-input');
				$field.siblings('label').removeClass('err-text');
			}
			return isValid;
		},
		orderCheckoutSubmit: function(){
			var userAgreementChecked = $($.Gomag.config.userAgreementLabel).find('input:checkbox').is(':checked');

			var emailValid = $.Gomag.isCheckoutEmailValid();
			var phoneValid = $.Gomag.isCheckoutPhoneValid();
			var shippingPhoneValid = $.Gomag.isCheckoutShippingPhoneValid();

			// Check if using combined field or separate fields
			var hasCombinedField = $('input[name="lastnamefirstname"]').length > 0;
			var lastnameValid = hasCombinedField ? $.Gomag.isCheckoutCombinedLastnameFirstnameValid() : $.Gomag.isCheckoutLastNameValid();
			var firstnameValid = hasCombinedField ? true : $.Gomag.isCheckoutFirstNameValid();

			var hasShippingCombinedField = $('input[name="shipping_lastnamefirstname"]').length > 0;
			var shippingLastnameValid = hasShippingCombinedField ? $.Gomag.isCheckoutShippingCombinedLastnameFirstnameValid() : $.Gomag.isCheckoutShippingLastNameValid();
			var shippingFirstnameValid = hasShippingCombinedField ? true : $.Gomag.isCheckoutShippingFirstNameValid();

			// Billing address validation
			var billingLastnameValid = $.Gomag.isCheckoutBillingLastNameValid();
			var billingFirstnameValid = $.Gomag.isCheckoutBillingFirstNameValid();

			if(!userAgreementChecked){
				if($($.Gomag.config.userAgreementLabel).length){
					$('html, body').animate({
						scrollTop: $($.Gomag.config.userAgreementLabel).offset().top
					}, 1000);
				}
				$($.Gomag.config.userAgreementLabel).addClass($.Gomag.config.userAgreementLabelErrorClass);
			} else if(!emailValid){

					$('html, body').animate({
						scrollTop: $('input[name="email"]').not('#_loginEmail').offset().top
					}, 1000);

			} else if(!lastnameValid){
					var fieldName = hasCombinedField ? 'lastnamefirstname' : 'lastname';
					$('html, body').animate({
						scrollTop: $('input[name="' + fieldName + '"]').offset().top
					}, 1000);

			} else if(!firstnameValid){

					$('html, body').animate({
						scrollTop: $('input[name="firstname"]').offset().top
					}, 1000);

			} else if(!phoneValid){

					$('html, body').animate({
						scrollTop: $('input[name="phone"]').offset().top
					}, 1000);

			} else if(!shippingLastnameValid) {
					var shippingFieldName = hasShippingCombinedField ? 'shipping_lastnamefirstname' : 'shipping_lastname';
					$('html, body').animate({
						scrollTop: $('input[name="' + shippingFieldName + '"]').offset().top
					}, 1000);
			} else if(!shippingFirstnameValid) {
				$('html, body').animate({
					scrollTop: $('input[name="shipping_firstname"]').offset().top
				}, 1000);
			} else if(!shippingPhoneValid) {
				$('html, body').animate({
					scrollTop: $('input[name="shipping_phone"]').offset().top
				}, 1000);
			} else if(!billingLastnameValid) {
				$('html, body').animate({
					scrollTop: $('input[name="billing_lastname"]').offset().top
				}, 1000);
			} else if(!billingFirstnameValid) {
				$('html, body').animate({
					scrollTop: $('input[name="billing_firstname"]').offset().top
				}, 1000);
			}

			if(userAgreementChecked && emailValid && phoneValid && lastnameValid && firstnameValid && shippingLastnameValid && shippingFirstnameValid && shippingPhoneValid && billingLastnameValid && billingFirstnameValid)
			{
				if(!$($.Gomag.config.checkoutSubmitButton).hasClass($.Gomag.config.checkoutSubmitButtonDisabled) && $.Gomag.checkoutFormCheck()){
					$.Gomag.trigger('Order/Checkout/Submit', {}, function (){
						$.Gomag.orderCheckoutFinalize();
					});

				}
			}
		},
		getSettingsValue: function(key)
		{
			return $.Gomag.settings[key] == undefined ? null : $.Gomag.settings[key];
		},
		displayPricesBox: function()
		{
			$('div.product-icon-box span').removeClass('hide');
			return $('div.price[data-block="ListingPrice"]').removeClass('-g-hide');
		},
		saveExternalCookies: function()
		{
			let searchParams = new URLSearchParams(window.location.search);
			if(searchParams.has('fbclid'))
			{
				let value = searchParams.get('fbclid');
				var expires = new Date();
				expires.setTime(expires.getTime() + parseInt(3600*24*1000*7));
				document.cookie = encodeURIComponent('fbclid') + "=" + encodeURIComponent(value) + '; expires='+ expires.toUTCString() + "; path=/";
			}
		},
		acceptgTypeScript: function()
		{
			document.querySelectorAll('script[data-gtype="script"]').forEach(oldScript => {
				const newScript = document.createElement('script');
				  newScript.textContent = oldScript.textContent;

				  // Copy attributes if needed
				  for (let attr of oldScript.attributes) {
					if (attr.name !== "type") {
					  newScript.setAttribute(attr.name, attr.value);
					}
				  }

				  oldScript.parentNode.replaceChild(newScript, oldScript);
			})

		},
		triggerGtypeLoadIfAccepted: function()
		{
			let cookieValue = $.Gomag.getCookie($.Gomag.cookiePolicyCookieName);
			if(cookieValue == 1)
			{
				$.Gomag.acceptgTypeScript();
			}

		},
		checkQueryStringData: function()
		{

			let gmqs = window.location.search;
			let gmup = new URLSearchParams(gmqs);
			$.each(queryStringCookies, function(i, v){
				var value = gmup.get(i);
				if(value != undefined && value)
				{
					var expies = 3600*24*1000*90
					$.Gomag.setCookie(v, value, expies);
				}
			})

		},
		init: function(environment){

			$.Gomag.orderSummaryUrl = environment ? environment.orderSummaryUrl : ($.Gomag.orderSummaryUrl ? $.Gomag.orderSummaryUrl : '');
			$.Gomag.settings = environment != undefined && environment != undefined ? environment.settings : $.Gomag.settings;

			$.Gomag.environment = environment ? environment.env : $.Gomag.environment;
			$.Gomag.languages = environment ? environment.languages : $.Gomag.languages;
			$.Gomag.currencies = environment ? environment.currencies : $.Gomag.currencies;
			$.Gomag.mainDomain = environment ? environment.mainDomain : $.Gomag.mainDomain;
			$.Gomag.productsStockDecimals = environment && environment.productsStockDecimals != undefined ? environment.productsStockDecimals : $.Gomag.productsStockDecimals;
			$.Gomag.setCID(environment && environment.CID != undefined ? environment.CID : $.Gomag.CID);
			$.Gomag.theme = environment ? environment.theme : $.Gomag.theme;
			$.Gomag.widgetUrl = environment ? environment.widgetUrl : ($.Gomag.widgetUrl ? $.Gomag.widgetUrl : '');
			$.Gomag.cartSummaryUrl = environment ? environment.cartSummaryUrl : ($.Gomag.cartSummaryUrl ? $.Gomag.cartSummaryUrl : '');
			$.Gomag.orderCkeckoutValidUrl = environment ? environment.orderCkeckoutValidUrl : ($.Gomag.orderCkeckoutValidUrl ? $.Gomag.orderCkeckoutValidUrl : '');
			$.Gomag.orderCheckoutUrl = environment ? environment.orderCheckoutUrl : ($.Gomag.orderCheckoutUrl ? $.Gomag.orderCheckoutUrl : '');
			$.Gomag.orderCkeckoutSaveUrl = environment ? environment.orderCkeckoutSaveUrl : ($.Gomag.orderCkeckoutSaveUrl ? $.Gomag.orderCkeckoutSaveUrl : '');
			$.Gomag.orderUrl = environment ? environment.orderUrl : ($.Gomag.orderUrl ? $.Gomag.orderUrl : '');
			$.Gomag.theme = environment ? environment.theme : $.Gomag.theme;
			$.Gomag.ajaxLoadUserDataUrl = environment ? environment.ajaxLoadUserDataUrl : ($.Gomag.ajaxLoadUserDataUrl ? $.Gomag.ajaxLoadUserDataUrl : '');
			$.Gomag.ajaxComponentsReload = environment ? environment.ajaxComponentsReload : ($.Gomag.ajaxComponentsReload ? $.Gomag.ajaxComponentsReload : '');
			$.Gomag.cookiePolicyCookieName = environment ? environment.cookiePolicyCookieName : ($.Gomag.cookiePolicyCookieName ? $.Gomag.cookiePolicyCookieName : 'g_c_consent');

			$.Gomag.ajaxLoadUserProductsUrl = environment ? environment.ajaxLoadUserProductsUrl : ($.Gomag.ajaxLoadUserProductsUrl ? $.Gomag.ajaxLoadUserProductsUrl : '');

			$.Gomag.addToCartUrl = environment ? environment.addToCartUrl : ($.Gomag.addToCartUrl ? $.Gomag.addToCartUrl : '');

			$.Gomag.checkPhoneNumberUrl = environment ? environment.checkPhoneNumberUrl : ($.Gomag.checkPhoneNumberUrl ? $.Gomag.checkPhoneNumberUrl : '');

			$.Gomag.setEnvData(environment && environment.envData != undefined ? environment.envData : {});
			$.Gomag.ajaxLoadProductDetails = environment ? environment.ajaxLoadProductDetails : ($.Gomag.ajaxLoadProductDetails ? $.Gomag.ajaxLoadProductDetails : '');

			$.Gomag.loggedInCustomer = new LoggedInCustomer();
			$.Gomag.addToCartPopup = new AddToCartPopup();

			$.Gomag.addToCartPopup.create(environment && environment.addToCartPopup != undefined ? environment.addToCartPopup : false);
			if($.Gomag.settings && $.Gomag.settings.addToCartPopupDisplayTime != undefined)
			{
				$.Gomag.addToCartPopup.updatePopupDisplayTime($.Gomag.settings.addToCartPopupDisplayTime);
			}

			$.Gomag.config = $GomagConfig;
			$.Gomag.loadWidgets();

			$.Gomag.secureFormsValues = environment && environment.secureForms != undefined ? environment.secureForms : {'isSecure' : false};

			$.Gomag.secureForms();
			$.Gomag.setLanguages();
			$.Gomag.setCurrencies();
			$.Gomag.checkQueryStringData();

			var scrollTriggered = false;
			$(window).scroll(function(){
				var scrollPercent = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());
				var scrollPercentFloor = parseInt(scrollPercent / 10)*10;
				if(50 <= scrollPercentFloor && !scrollTriggered){
					scrollTriggered = true;
					$.Gomag.triggerLoadWidget('popup:onscroll:50');
				}
			});

			if($.Gomag.settings && $.Gomag.settings.asyncClick != undefined && $.Gomag.settings.asyncClick)
			{

				$(document).on('click', $.Gomag.config.listProductUrlClick,function(e){
					e.preventDefault();
					data = {};
					data.url = $(this).attr('href');
					data.product = $(this).parents('div.product-box').data('product-id');
					$.Gomag.asyncClick('Product/Box/Click', data, data.url);
				})




			}
			/*add to cart*/
			/*
			$(document).bind().on('blur', $.Gomag.config.addToCartQuantity, function(e){
				if($(this).val()) {
					var thisElement = this;
					setTimeout(function() {
						var quantity = $.Gomag.getCartProductQuantity($(thisElement).data('id'))
						$(thisElement).val(quantity);

						$.Gomag.setProductPriceForQuantity($(thisElement).data('id'), quantity);

						$.Gomag.trigger('Cart/Quantity/Changed/On/Blur', {rowId: $(thisElement).attr('id')});
					}, 1000);
				}
			})
			*/
			$(document).on('keyup', $.Gomag.config.addToCartQuantity, function(e){
				if($(this).val()) {
					$(this).closest('.qty-h').find('.updateCartQuantity').css('display', 'block');
				}
			})

			/*add to cart END*/



			$(document).on('click', $.Gomag.config.checkoutSubmitButton, function(){
				$.Gomag.orderCheckoutSubmit();

			})

			$.each(dataAppend, function(i, v){

				$.Gomag.append(v.dataBlock, v.value);
			})
			$.each(dataInside, function(i, v){
				$.Gomag.inside(v.dataBlock, v.value);
			})
			$.each(dataPrepend, function(i, v){
				$.Gomag.prepend(v.dataBlock, v.value);
			})
			$.each(dataRun, function(i, v){

				typeof window[v] === 'function'
							?
							window[v]()
							:
							v()
				;

			})
			$.each(dataProductAjax, function(i, v){
				$.Gomag.productAjax(v.dataUrl, v.dataSelector, v.dataAttr, v.dataFunction);
			});

			$('.listImage').each(function(){
				if($(this).attr('data-image')){

					$(this).attr('src', $(this).attr('data-image')).removeClass('hidden');
					$(this).attr('data-image', '');
				}
			});

			if($( window ).width() > 1090 ){
				/* on hover run product box slider */
				$($.Gomag.config.productListImageCarousel).mouseenter(function(){
					var $this = $(this)
					if ($this.find('li').length > 1) {
						var nItems = $this.find('li').length

						var disableAutoplay = $(this).data('slidespeed') === 'manual';
						var speed = $(this).data('slidespeed') != undefined && $(this).data('slidespeed') != '' ? parseInt($(this).data('slidespeed')) : 1050;

						if(disableAutoplay){
							if(!$this.closest('.carousel').length){
								$this.not('.slick-initialized').slick({
									infinite: false,
									arrows: true,
									dots: true,
									speed: 300
									//fade: true
								});

								$('.-g-product-list-image-carousel .slick-arrow, .-g-product-list-image-carousel .slick-dots').on('mouseenter', function() {
									$(this).parent().addClass('-g-disable-link');
								});

								$('.-g-product-list-image-carousel .slick-arrow, .-g-product-list-image-carousel .slick-dots').on('mouseleave', function() {
									$(this).parent().removeClass('-g-disable-link');
								});

								$('.-g-product-list-image-carousel').on('click', function() {
									if(($this).hasClass('-g-disable-link')){
										return false;
									}
								});

								$this.addClass($.Gomag.config.productListImageCarouselActive);
								$this.closest('.product-box').find('.product-icon-box').addClass('-g-icon-box-inactive');
							}

						}else{
							$this.next('.-g-progress-bar-list-carousel').addClass('on').css('animation-duration', nItems*(speed + 300)+'ms');
							$this.not('.slick-initialized').slick({
								autoplay: true,
								infinite: true,
								arrows: false,
								speed: 300,
								fade: true,
								pauseOnHover: false,
								autoplaySpeed: speed
							});

							$this.addClass($.Gomag.config.productListImageCarouselActive);
						}

					}
				})
				.mouseleave(function(){
					var $this = $(this)
					if ($this.find('li').length > 1) {
						$this.removeClass($.Gomag.config.productListImageCarouselActive);
						$this.closest('.product-box').find('.product-icon-box').removeClass('-g-icon-box-inactive');
						$this.next('.-g-progress-bar-list-carousel').removeClass('on');
						if($this.hasClass('slick-initialized')){
							$this.slick('unslick');
						}
					}
				})
				/* on hover run product box slider */
				$(document).on('mouseenter', '.box-holder:has(.-g-product-list-image-flip)', function() {
					var img = $(this).find($.Gomag.config.productListImageFlip);

					if (img.data('flip')) {
						var flipimage = img.data('flip');
						img.prop('src', flipimage);
						img.attr('old-srcset', img.prop('srcset'));
						img.removeAttr('srcset');
					}
				});

				$(document).on('mouseleave', '.box-holder:has(.-g-product-list-image-flip)', function() {
					var img = $(this).find($.Gomag.config.productListImageFlip);

					img.prop('src', img.data('main'));

					var oldSrcset = img.attr('old-srcset');
					if (oldSrcset) {
						img.prop('srcset', oldSrcset);
					}
				});

				/* on version image */
				$(document).on('mouseenter', $.Gomag.config.versionAttributesImage, function () {
					if($(this).attr('data-src')){
						var newSrc = $(this).attr('data-src').replace('/medium/', '/large/');
						const image = $('#img_0');
						const picture = image.closest('picture');
						if (picture.length) {
							newSrc = newSrc.replace('/large/', '/original/');
							picture.find('source').each(function () {
								$(this).attr('data-old-srcset', $(this).attr('srcset'));
								$(this).removeAttr('srcset');
							});
						}
						image.attr('src', newSrc);
					}
				}).on('mouseleave', $.Gomag.config.versionAttributesImage, function () {
					const image = $('#img_0');
					const original = image.attr('data-src');
					const picture = image.closest('picture');
					if (picture.length) {
						picture.find('source').each(function () {
							const old = $(this).attr('data-old-srcset');
							if (old) $(this).attr('srcset', old);
						});
					}
					image.attr('src', original);
				});

				$(document).on('mouseenter', $.Gomag.config.versionAttributesProductBoxImage, function () {
					const image = $(this).closest('.product-box').find('.image > .listImage');
					const sliderItem = $(this).closest('.owl-item');

					if (sliderItem.length) {
						const boxHolder = $(this).closest('.box-holder');
						boxHolder.css('min-height', boxHolder.outerHeight());
					}

					image.attr('src', $(this).attr('data-img'));
					image.attr('old-srcset', image.attr('srcset'));
					image.removeAttr('srcset');
				}).on('mouseleave', $.Gomag.config.versionAttributesProductBoxImage, function () {
					const image = $(this).closest('.product-box').find('.image > .listImage');
					const boxHolder = $(this).closest('.box-holder');
					const sliderItem = $(this).closest('.owl-item');

					image.attr('src', image.attr('data-src'));
					const oldSrcset = image.attr('old-srcset');
					if (oldSrcset) {
						image.attr('srcset', oldSrcset);
					} else {
						image.removeAttr('srcset');
					}
					image.removeAttr('old-srcset');

					if(sliderItem.length){
						image.one('load', function() {
							boxHolder.css('min-height', '');
						}).each(function() {
							if (this.complete) $(this).trigger('load');
						});
					}

				});

			} else {
				/* if el is in viewport and parent is not carousel run product box slider */
				$.fn.isHalfVisible = function(){
					var winH = $(window).height(),
					elTop = $(window).scrollTop(),
					elBottom = elTop + winH,
					elCenter = $(this).offset().top + $(this).height()/2;
					return ((elCenter >= elTop) && (elCenter < elBottom));
				};

				$(window).on('scroll', function() {
					$($.Gomag.config.productListImageCarousel).each(function() {
						if($(this).hasClass('-g-ignore-mobile'))
						{
							return true;
						}
						if($(this).closest('.carousel-slide').length){
							return true;
						}
						if ($(this).isHalfVisible()) {
							var $this = $(this)
							if ($this.find('li').length > 1) {
								var disableAutoplay = $this.data('slidespeed') === 'manual';
								var nItems = $this.find('li').length

								if(disableAutoplay){
									if(!$this.closest('.carousel').length){
										$this.not('.slick-initialized').slick({
											infinite: false,
											arrows: true,
											dots: true,
											speed: 300
										});

										$this.addClass($.Gomag.config.productListImageCarouselActive);
									}
								}else{
									$this.next('.-g-progress-bar-list-carousel').addClass('on').css('animation-duration', nItems*1350+'ms');
									$this.not('.slick-initialized').slick({
										autoplay: true,
										infinite: true,
										arrows: false,
										speed: 300,
										fade: true,
										pauseOnHover: false,
										autoplaySpeed: 1050
									});

									$this.addClass($.Gomag.config.productListImageCarouselActive);
								}
							}
						} else {
							var $this = $(this)
							if ($this.find('li').length > 1) {
								$this.removeClass($.Gomag.config.productListImageCarouselActive);
								$this.next('.-g-progress-bar-list-carousel').removeClass('on');
								if($this.hasClass('slick-initialized')){
									$this.slick('unslick');
								}
							}
						}
					});
				});
			}
			/*build product request*/
			$.Gomag.buildProductsForDataRequest();

			$(document).mouseleave(function (e) {
				if(!$('input').is(':focus')){
					if (e.target.nodeName.toLowerCase() !== "select") {
						$.Gomag.triggerLoadWidget('popup:onexit');
					}
				}
			});
			if(
				$.Gomag.environment != undefined
				&&
				($.Gomag.environment['Page/Order'] != undefined
				||
				$.Gomag.environment['Page/OrderCheckout'] != undefined)
				&&
				$( window ).width() < 860
			)
			{
				$(document).on('click', 'a', function(e){
					var displayCartRecoveryPopupInOrder = $.Gomag.displayCartRecoveryPopupInOrder($(this));

					if(displayCartRecoveryPopupInOrder === true)
					{
						var wasTriggered = $.Gomag.triggerPopup('popup:onexit');
						if(wasTriggered !== ''){
							$.Gomag.setCookie(wasTriggered, 1, defaultCookieTimeOneDay);
							e.preventDefault();
						}
					}

				})
			}

			$.Gomag.saveExternalCookies();
			$.Gomag.trigger('Page/Load', $.Gomag.settings);
			$.Gomag.triggerGtypeLoadIfAccepted();
		},
		isMobile: function() {
			return window.matchMedia("only screen and (max-width: 760px)").matches;
 		}

	}

})(jQuery,window,document);
$.Gomag.bind('Cookie/Policy/Consent/Granted', function(){
	$.Gomag.triggerGtypeLoadIfAccepted();
})
