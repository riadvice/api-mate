// Generated by CoffeeScript 1.6.3
(function() {
  var ApiMate, getHashParams, inputValue, isFilled, makeSearchRegexp, pad, parseQueryString, postErrorTemplate, postSuccessTemplate, preUploadUrl, resultsTemplate;

  resultsTemplate = "<div class='api-mate-results'>     <div class='api-mate-links'>       {{#urls}}         <div class='api-mate-link-wrapper'>           <div class='api-mate-link {{urlClass}}'>             <i class='glyphicon glyphicon-headphones icon-url-standard'></i>             <i class='glyphicon glyphicon-record icon-url-recordings'></i>             <i class='glyphicon glyphicon-phone icon-url-from-mobile'></i>             <i class='glyphicon glyphicon-user icon-url-custom-call'></i>             <a href='#' data-url='{{url}}' class='tooltipped label'                title='Send \"{{name}}\" using a POST request'                data-api-mate-post='{{name}}'>post</a>             <span class='api-mate-method-name'>{{description}}</span>             <a href='{{url}}' target='_blank'>{{url}}</a>           </div>         </div>       {{/urls}}     </div>     <div class='api-mate-result-title'>       <h5 class='label-title'>Results {{title}}:</h5>     </div>   </div>";

  postSuccessTemplate = "<pre>{{response}}</pre>";

  postErrorTemplate = "<p>Server responded with status: <code>{{status}}: {{statusText}}</code>.</p>   {{#response}}     <p>Content:</p>     <pre>{{response}}</pre>   {{/response}}   {{^response}}     <p>Content: <code>-- no content --</code></p>   {{/response}}   <p>If you don't know the reason for this error, check these possibilities:</p>   <ul>     <li>       Your server does not allow <strong>cross-domain requests</strong>.       By default BigBlueButton and Mconf-Live <strong>do not</strong> allow cross-domain       requests, so you have to enable it to test this request via POST. Check our       <a href=\"https://github.com/mconf/api-mate/tree/master#allow-cross-domain-requests\">README</a>       for instructions on how to do it.     </li>     <li>       This API method cannot be accessed via POST.     </li>     <li>       Your server is down or malfunctioning. Log into it and check if everything is OK with       <code>bbb-conf --check</code>.     </li>   <ul>";

  preUploadUrl = "<?xml version='1.0' encoding='UTF-8'?>     <modules>       <module name='presentation'>         {{#urls}}           <document url='{{url}}' />         {{/urls}}       </module>     </modules>";

  window.ApiMate = ApiMate = (function() {
    function ApiMate(placeholders, templates) {
      var _base, _base1, _base2, _base3;
      this.placeholders = placeholders;
      this.templates = templates;
      this.updatedTimer = null;
      this.urls = [];
      if (this.placeholders == null) {
        this.placeholders = {};
      }
      if (this.templates == null) {
        this.templates = {};
      }
      if ((_base = this.templates)['results'] == null) {
        _base['results'] = resultsTemplate;
      }
      if ((_base1 = this.templates)['postSuccess'] == null) {
        _base1['postSuccess'] = postSuccessTemplate;
      }
      if ((_base2 = this.templates)['postError'] == null) {
        _base2['postError'] = postErrorTemplate;
      }
      if ((_base3 = this.templates)['preUpload'] == null) {
        _base3['preUpload'] = preUploadUrl;
      }
      this.debug = false;
    }

    ApiMate.prototype.start = function() {
      var _this = this;
      this.initializeMenu();
      $("[data-api-mate-param*='meetingID']").on("keyup", function() {
        return $("[data-api-mate-param*='name']").val($(this).val());
      });
      $("[data-api-mate-param]").on("change keyup", function(e) {
        _this.generateUrls();
        return _this.addUrlsToPage(_this.urls);
      });
      $("[data-api-mate-server]").on("change keyup", function(e) {
        _this.generateUrls();
        return _this.addUrlsToPage(_this.urls);
      });
      $("[data-api-mate-special-param]").on("change keyup", function(e) {
        _this.generateUrls();
        return _this.addUrlsToPage(_this.urls);
      });
      $("[data-api-mate-expand]").on("click", function() {
        var selected;
        selected = !$("[data-api-mate-expand]").hasClass("active");
        _this.expandLinks(selected);
        return true;
      });
      $("[data-api-mate-clear]").on("click", function(e) {
        _this.clearAllFields();
        _this.generateUrls();
        return _this.addUrlsToPage(_this.urls);
      });
      $("[data-api-mate-debug]").on("click", function() {
        var selected;
        selected = !$("[data-api-mate-debug]").hasClass("active");
        _this.debug = selected;
        return true;
      });
      this.generateUrls();
      this.addUrlsToPage(this.urls);
      this.bindPostRequests();
      return this.bindSearch();
    };

    ApiMate.prototype.initializeMenu = function() {
      var name, prop, query, query2, user, value, vbridge, _results;
      vbridge = "7" + pad(Math.floor(Math.random() * 10000 - 1).toString(), 4);
      $("[data-api-mate-param*='voiceBridge']").val(vbridge);
      name = "random-" + Math.floor(Math.random() * 10000000).toString();
      $("[data-api-mate-param*='name']").val(name);
      $("[data-api-mate-param*='meetingID']").val(name);
      user = "User " + Math.floor(Math.random() * 10000000).toString();
      $("[data-api-mate-param*='fullName']").val(user);
      query = getHashParams();
      query2 = parseQueryString(window.location.search.substring(1));
      query = _.extend(query2, query);
      if (query.server != null) {
        $("[data-api-mate-server='url']").val(query.server);
        delete query.server;
      }
      if (query.salt != null) {
        $("[data-api-mate-server='salt']").val(query.salt);
        delete query.salt;
      }
      if (query.sharedSecret != null) {
        $("[data-api-mate-server='salt']").val(query.sharedSecret);
        delete query.sharedSecret;
      }
      _results = [];
      for (prop in query) {
        value = query[prop];
        $("[data-api-mate-param*='" + prop + "']").val(value);
        _results.push($("[data-api-mate-special-param*='" + prop + "']").val(value));
      }
      return _results;
    };

    ApiMate.prototype.addUrlsToPage = function(urls) {
      var desc, html, item, opts, placeholder, _i, _len,
        _this = this;
      placeholder = $(this.placeholders['results']);
      for (_i = 0, _len = urls.length; _i < _len; _i++) {
        item = urls[_i];
        desc = item.description;
        if (desc.match(/recordings/i)) {
          item.urlClass = "api-mate-url-recordings";
        } else if (desc.match(/mobile/i)) {
          item.urlClass = "api-mate-url-from-mobile";
        } else if (desc.match(/custom call/i)) {
          item.urlClass = "api-mate-url-custom-call";
        } else {
          item.urlClass = "api-mate-url-standard";
        }
      }
      opts = {
        title: new Date().toTimeString(),
        urls: urls
      };
      html = Mustache.to_html(this.templates['results'], opts);
      $(placeholder).html(html);
      this.expandLinks($("[data-api-mate-expand]").hasClass("active"));
      $('.api-mate-results', this.placeholders['results']).addClass("updated");
      clearTimeout(this.updatedTimer);
      this.updatedTimer = setTimeout(function() {
        return $('.api-mate-results', _this.placeholders['results']).removeClass("updated");
      }, 300);
      return $(this.placeholders['results']).trigger('api-mate-urls-added');
    };

    ApiMate.prototype.getApi = function() {
      var server;
      server = {};
      server.url = $("[data-api-mate-server='url']").val();
      server.salt = $("[data-api-mate-server='salt']").val();
      server.url = server.url.replace(/(\/api)?\/?$/, '/api');
      server.name = server.url;
      return new BigBlueButtonApi(server.url, server.salt, this.debug);
    };

    ApiMate.prototype.generateUrls = function() {
      var api, customCalls, line, lines, name, paramName, paramValue, params, separator, _elem, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref;
      params = {};
      $('[data-api-mate-param]').each(function() {
        var $elem, attr, attrs, value, _i, _len;
        $elem = $(this);
        attrs = $elem.attr('data-api-mate-param').split(',');
        value = inputValue($elem);
        if ((attrs != null) && (value != null)) {
          for (_i = 0, _len = attrs.length; _i < _len; _i++) {
            attr = attrs[_i];
            params[attr] = value;
          }
        }
        return true;
      });
      lines = inputValue("textarea[data-api-mate-special-param='meta']");
      if (lines != null) {
        lines = lines.replace(/\r\n/g, "\n").split("\n");
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          separator = line.indexOf("=");
          if (separator >= 0) {
            paramName = line.substring(0, separator);
            paramValue = line.substring(separator + 1, line.length);
            params["meta_" + paramName] = paramValue;
          }
        }
      }
      lines = inputValue("textarea[data-api-mate-special-param='custom-params']");
      if (lines != null) {
        lines = lines.replace(/\r\n/g, "\n").split("\n");
        for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
          line = lines[_j];
          separator = line.indexOf("=");
          if (separator >= 0) {
            paramName = line.substring(0, separator);
            paramValue = line.substring(separator + 1, line.length);
            params["custom_" + paramName] = paramValue;
          }
        }
      }
      lines = inputValue("textarea[data-api-mate-special-param='custom-calls']");
      if (lines != null) {
        lines = lines.replace(/\r\n/g, "\n").split("\n");
        customCalls = lines;
      } else {
        customCalls = null;
      }
      api = this.getApi();
      this.urls = [];
      _elem = function(name, desc, url) {
        return {
          name: name,
          description: desc,
          url: url
        };
      };
      _ref = api.availableApiCalls();
      for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
        name = _ref[_k];
        if (name === 'join') {
          params['password'] = params['moderatorPW'];
          this.urls.push(_elem(name, "" + name + " as moderator", api.urlFor(name, params)));
          params['password'] = params['attendeePW'];
          this.urls.push(_elem(name, "" + name + " as attendee", api.urlFor(name, params)));
          params['password'] = params['moderatorPW'];
        } else {
          this.urls.push(_elem(name, name, api.urlFor(name, params)));
        }
      }
      if (customCalls != null) {
        for (_l = 0, _len3 = customCalls.length; _l < _len3; _l++) {
          name = customCalls[_l];
          this.urls.push(_elem(name, "custom call: " + name, api.urlFor(name, params)));
        }
      }
      params['password'] = params['moderatorPW'];
      this.urls.push(_elem("join", "mobile call: join as moderator", api.setMobileProtocol(api.urlFor("join", params))));
      params['password'] = params['attendeePW'];
      return this.urls.push(_elem("join", "mobile call: join as attendee", api.setMobileProtocol(api.urlFor("join", params))));
    };

    ApiMate.prototype.clearAllFields = function() {
      return $("[data-api-mate-param]").each(function() {
        $(this).val("");
        return $(this).attr("checked", null);
      });
    };

    ApiMate.prototype.expandLinks = function(selected) {
      if (selected) {
        return $(".api-mate-link", this.placeholders['results']).addClass('expanded');
      } else {
        return $(".api-mate-link", this.placeholders['results']).removeClass('expanded');
      }
    };

    ApiMate.prototype.bindPostRequests = function() {
      var _apiMate;
      _apiMate = this;
      return $(document).on('click', 'a[data-api-mate-post]', function(e) {
        var $target, contentType, data, href, method;
        $target = $(this);
        href = $target.attr('data-url');
        method = $target.attr('data-api-mate-post');
        data = _apiMate.getPostData(method);
        contentType = _apiMate.getPostContentType(method);
        $('[data-api-mate-post]').addClass('disabled');
        $.ajax({
          url: href,
          type: "POST",
          crossDomain: true,
          contentType: contentType,
          dataType: "xml",
          data: data,
          complete: function(jqxhr, status) {
            var html, modal, opts, postError, postSuccess;
            modal = _apiMate.placeholders['modal'];
            postSuccess = _apiMate.templates['postSuccess'];
            postError = _apiMate.templates['postError'];
            if (jqxhr.status === 200) {
              $('.modal-header', modal).removeClass('alert-danger');
              $('.modal-header', modal).addClass('alert-success');
              html = Mustache.to_html(postSuccess, {
                response: jqxhr.responseText
              });
              $('.modal-body', modal).html(html);
            } else {
              $('.modal-header h4', modal).text('Ooops!');
              $('.modal-header', modal).addClass('alert-danger');
              $('.modal-header', modal).removeClass('alert-success');
              opts = {
                status: jqxhr.status,
                statusText: jqxhr.statusText
              };
              if (!_.isEmpty(jqxhr.responseText)) {
                opts['response'] = jqxhr.responseText;
              }
              html = Mustache.to_html(postError, opts);
              $('.modal-body', modal).html(html);
            }
            $(modal).modal({
              show: true
            });
            return $('[data-api-mate-post]').removeClass('disabled');
          }
        });
        e.preventDefault();
        return false;
      });
    };

    ApiMate.prototype.getPostData = function(method) {
      var api, checksum, opts, query, urls;
      if (method === 'create') {
        urls = inputValue("textarea[data-api-mate-param='pre-upload']");
        if (urls != null) {
          urls = urls.replace(/\r\n/g, "\n").split("\n");
          urls = _.map(urls, function(u) {
            return {
              url: u
            };
          });
          opts = {
            urls: urls
          };
          return Mustache.to_html(this.templates['preUpload'], opts);
        }
      } else if (method === 'setConfigXML') {
        if (isFilled("textarea[data-api-mate-param='configXML']")) {
          api = this.getApi();
          query = "configXML=" + (api.encodeForUrl($("#input-config-xml").val()));
          query += "&meetingID=" + (api.encodeForUrl($("#input-id").val()));
          checksum = api.checksum('setConfigXML', query);
          query += "&checksum=" + checksum;
          return query;
        }
      }
    };

    ApiMate.prototype.getPostContentType = function(method) {
      if (method === 'create') {
        return 'application/xml; charset=utf-8';
      } else if (method === 'setConfigXML') {
        return 'application/x-www-form-urlencoded';
      }
    };

    ApiMate.prototype.bindSearch = function() {
      var _apiMate;
      _apiMate = this;
      return $(document).on('keyup', '[data-api-mate-search-input]', function(e) {
        var $target, search, searchTerm;
        $target = $(this);
        searchTerm = inputValue($target);
        search = function() {
          var $elem, attr, attrs, searchRe, visible, _i, _len, _ref, _ref1;
          $elem = $(this);
          if ((searchTerm != null) && !_.isEmpty(searchTerm.trim())) {
            visible = false;
            searchRe = makeSearchRegexp(searchTerm);
            attrs = ((_ref = $elem.attr('data-api-mate-param')) != null ? _ref.split(',') : void 0) || [];
            attrs = attrs.concat(((_ref1 = $elem.attr('data-api-mate-search')) != null ? _ref1.split(',') : void 0) || []);
            for (_i = 0, _len = attrs.length; _i < _len; _i++) {
              attr = attrs[_i];
              if (attr.match(searchRe)) {
                visible = true;
              }
            }
          } else {
            visible = true;
          }
          if (visible) {
            $elem.parents('.form-group').show();
          } else {
            $elem.parents('.form-group').hide();
          }
          return true;
        };
        $('[data-api-mate-param]').each(search);
        return $('[data-api-mate-special-param]').each(search);
      });
    };

    return ApiMate;

  })();

  inputValue = function(selector) {
    var $elem, type, value, _ref;
    if (_.isString(selector)) {
      $elem = $(selector);
    } else {
      $elem = selector;
    }
    type = $elem.attr('type') || ((_ref = $elem.prop('tagName')) != null ? _ref.toLowerCase() : void 0);
    switch (type) {
      case 'checkbox':
        return $elem.is(":checked");
      default:
        value = $elem.val();
        if ((value != null) && !_.isEmpty(value.trim())) {
          return value;
        } else {
          return null;
        }
    }
  };

  isFilled = function(field) {
    var value;
    value = $(field).val();
    return (value != null) && !_.isEmpty(value.trim());
  };

  pad = function(num, size) {
    var s, _i, _ref;
    s = '';
    for (_i = 0, _ref = size - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--) {
      s += '0';
    }
    s += num;
    return s.substr(s.length - size);
  };

  parseQueryString = function(queryString) {
    var i, l, params, queries, temp;
    params = {};
    if ((queryString != null) && !_.isEmpty(queryString)) {
      queries = queryString.split("&");
    } else {
      queries = [];
    }
    i = 0;
    l = queries.length;
    while (i < l) {
      temp = queries[i].split('=');
      params[temp[0]] = temp[1];
      i++;
    }
    return params;
  };

  makeSearchRegexp = function(term) {
    var terms;
    terms = term.split(" ");
    terms = _.filter(terms, function(t) {
      return !_.isEmpty(t.trim());
    });
    terms = _.map(terms, function(t) {
      return ".*" + t + ".*";
    });
    terms = terms.join('|');
    return new RegExp(terms, "i");
  };

  getHashParams = function() {
    var a, d, e, hashParams, q, r;
    hashParams = {};
    a = /\+/g;
    r = /([^&;=]+)=?([^&;]*)/g;
    d = function(s) {
      return decodeURIComponent(s.replace(a, " "));
    };
    q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
      hashParams[d(e[1])] = d(e[2]);
    }
    return hashParams;
  };

}).call(this);
