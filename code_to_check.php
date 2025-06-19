<!doctype html>
<html lang=en>

<head>
    <title>jwt.exceptions.InvalidSubjectError: Subject must be a string
        // Werkzeug Debugger</title>
    <link rel="stylesheet" href="?__debugger__=yes&amp;cmd=resource&amp;f=style.css">
    <link rel="shortcut icon" href="?__debugger__=yes&amp;cmd=resource&amp;f=console.png">
    <script src="?__debugger__=yes&amp;cmd=resource&amp;f=debugger.js"></script>
    <script>
        var CONSOLE_MODE = false,
          EVALEX = true,
          EVALEX_TRUSTED = false,
          SECRET = "tX0cucMvSyX6uBG5YdQL";
    </script>
</head>

<body style="background-color: #fff">
    <div class="debugger">
        <h1>InvalidSubjectError</h1>
        <div class="detail">
            <p class="errormsg">jwt.exceptions.InvalidSubjectError: Subject must be a string
            </p>
        </div>
        <h2 class="traceback">Traceback <em>(most recent call last)</em></h2>
        <div class="traceback">
            <h3></h3>
            <ul>
                <li>
                    <div class="frame" id="frame-2154767750704">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py"</cite>,
                            line <em class="line">1536</em>,
                            in <code class="function">__call__</code></h4>
                        <div class="source library">
                            <pre class="line before"><span class="ws">    </span>) -&gt; cabc.Iterable[bytes]:</pre>
                            <pre
                                class="line before"><span class="ws">        </span>&#34;&#34;&#34;The WSGI server calls the Flask application object as the</pre>
                            <pre
                                class="line before"><span class="ws">        </span>WSGI application. This calls :meth:`wsgi_app`, which can be</pre>
                            <pre class="line before"><span class="ws">        </span>wrapped to apply middleware.</pre>
                            <pre class="line before"><span class="ws">        </span>&#34;&#34;&#34;</pre>
                            <pre class="line current"><span class="ws">        </span>return self.wsgi_app(environ, start_response)
<span class="ws">        </span>       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767751136">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py"</cite>,
                            line <em class="line">1514</em>,
                            in <code class="function">wsgi_app</code></h4>
                        <div class="source library">
                            <pre class="line before"><span class="ws">            </span>try:</pre>
                            <pre class="line before"><span class="ws">                </span>ctx.push()</pre>
                            <pre
                                class="line before"><span class="ws">                </span>response = self.full_dispatch_request()</pre>
                            <pre class="line before"><span class="ws">            </span>except Exception as e:</pre>
                            <pre class="line before"><span class="ws">                </span>error = e</pre>
                            <pre class="line current"><span class="ws">                </span>response = self.handle_exception(e)
<span class="ws">                </span>           ^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws">            </span>except:  # noqa: B001</pre>
                            <pre
                                class="line after"><span class="ws">                </span>error = sys.exc_info()[1]</pre>
                            <pre class="line after"><span class="ws">                </span>raise</pre>
                            <pre
                                class="line after"><span class="ws">            </span>return response(environ, start_response)</pre>
                            <pre class="line after"><span class="ws">        </span>finally:</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767752144">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask_cors\extension.py"</cite>,
                            line <em class="line">176</em>,
                            in <code class="function">wrapped_function</code></h4>
                        <div class="source library">
                            <pre
                                class="line before"><span class="ws">        </span># These error handlers will still respect the behavior of the route</pre>
                            <pre
                                class="line before"><span class="ws">        </span>if options.get(&#34;intercept_exceptions&#34;, True):</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">            </span>def _after_request_decorator(f):</pre>
                            <pre
                                class="line before"><span class="ws">                </span>def wrapped_function(*args, **kwargs):</pre>
                            <pre class="line current"><span class="ws">                    </span>return cors_after_request(app.make_response(f(*args, **kwargs)))
<span class="ws">                    </span>                                            ^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre
                                class="line after"><span class="ws">                </span>return wrapped_function</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre
                                class="line after"><span class="ws">            </span>if hasattr(app, &#34;handle_exception&#34;):</pre>
                            <pre
                                class="line after"><span class="ws">                </span>app.handle_exception = _after_request_decorator(app.handle_exception)</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767752864">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py"</cite>,
                            line <em class="line">1511</em>,
                            in <code class="function">wsgi_app</code></h4>
                        <div class="source library">
                            <pre
                                class="line before"><span class="ws">        </span>ctx = self.request_context(environ)</pre>
                            <pre
                                class="line before"><span class="ws">        </span>error: BaseException | None = None</pre>
                            <pre class="line before"><span class="ws">        </span>try:</pre>
                            <pre class="line before"><span class="ws">            </span>try:</pre>
                            <pre class="line before"><span class="ws">                </span>ctx.push()</pre>
                            <pre class="line current"><span class="ws">                </span>response = self.full_dispatch_request()
<span class="ws">                </span>           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws">            </span>except Exception as e:</pre>
                            <pre class="line after"><span class="ws">                </span>error = e</pre>
                            <pre
                                class="line after"><span class="ws">                </span>response = self.handle_exception(e)</pre>
                            <pre class="line after"><span class="ws">            </span>except:  # noqa: B001</pre>
                            <pre
                                class="line after"><span class="ws">                </span>error = sys.exc_info()[1]</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767753008">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py"</cite>,
                            line <em class="line">919</em>,
                            in <code class="function">full_dispatch_request</code></h4>
                        <div class="source library">
                            <pre
                                class="line before"><span class="ws">            </span>request_started.send(self, _async_wrapper=self.ensure_sync)</pre>
                            <pre
                                class="line before"><span class="ws">            </span>rv = self.preprocess_request()</pre>
                            <pre class="line before"><span class="ws">            </span>if rv is None:</pre>
                            <pre
                                class="line before"><span class="ws">                </span>rv = self.dispatch_request()</pre>
                            <pre class="line before"><span class="ws">        </span>except Exception as e:</pre>
                            <pre class="line current"><span class="ws">            </span>rv = self.handle_user_exception(e)
<span class="ws">            </span>     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre
                                class="line after"><span class="ws">        </span>return self.finalize_request(rv)</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre class="line after"><span class="ws">    </span>def finalize_request(</pre>
                            <pre class="line after"><span class="ws">        </span>self,</pre>
                            <pre
                                class="line after"><span class="ws">        </span>rv: ft.ResponseReturnValue | HTTPException,</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767753152">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask_cors\extension.py"</cite>,
                            line <em class="line">176</em>,
                            in <code class="function">wrapped_function</code></h4>
                        <div class="source library">
                            <pre
                                class="line before"><span class="ws">        </span># These error handlers will still respect the behavior of the route</pre>
                            <pre
                                class="line before"><span class="ws">        </span>if options.get(&#34;intercept_exceptions&#34;, True):</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">            </span>def _after_request_decorator(f):</pre>
                            <pre
                                class="line before"><span class="ws">                </span>def wrapped_function(*args, **kwargs):</pre>
                            <pre class="line current"><span class="ws">                    </span>return cors_after_request(app.make_response(f(*args, **kwargs)))
<span class="ws">                    </span>                                            ^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre
                                class="line after"><span class="ws">                </span>return wrapped_function</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre
                                class="line after"><span class="ws">            </span>if hasattr(app, &#34;handle_exception&#34;):</pre>
                            <pre
                                class="line after"><span class="ws">                </span>app.handle_exception = _after_request_decorator(app.handle_exception)</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767753296">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py"</cite>,
                            line <em class="line">917</em>,
                            in <code class="function">full_dispatch_request</code></h4>
                        <div class="source library">
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre class="line before"><span class="ws">        </span>try:</pre>
                            <pre
                                class="line before"><span class="ws">            </span>request_started.send(self, _async_wrapper=self.ensure_sync)</pre>
                            <pre
                                class="line before"><span class="ws">            </span>rv = self.preprocess_request()</pre>
                            <pre class="line before"><span class="ws">            </span>if rv is None:</pre>
                            <pre class="line current"><span class="ws">                </span>rv = self.dispatch_request()
<span class="ws">                </span>     ^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws">        </span>except Exception as e:</pre>
                            <pre
                                class="line after"><span class="ws">            </span>rv = self.handle_user_exception(e)</pre>
                            <pre
                                class="line after"><span class="ws">        </span>return self.finalize_request(rv)</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre class="line after"><span class="ws">    </span>def finalize_request(</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767753440">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py"</cite>,
                            line <em class="line">902</em>,
                            in <code class="function">dispatch_request</code></h4>
                        <div class="source library">
                            <pre
                                class="line before"><span class="ws">            </span>and req.method == &#34;OPTIONS&#34;</pre>
                            <pre class="line before"><span class="ws">        </span>):</pre>
                            <pre
                                class="line before"><span class="ws">            </span>return self.make_default_options_response()</pre>
                            <pre
                                class="line before"><span class="ws">        </span># otherwise dispatch to the handler for that endpoint</pre>
                            <pre
                                class="line before"><span class="ws">        </span>view_args: dict[str, t.Any] = req.view_args  # type: ignore[assignment]</pre>
                            <pre class="line current"><span class="ws">        </span>return self.ensure_sync(self.view_functions[rule.endpoint])(**view_args)  # type: ignore[no-any-return]
<span class="ws">        </span>       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre
                                class="line after"><span class="ws">    </span>def full_dispatch_request(self) -&gt; Response:</pre>
                            <pre
                                class="line after"><span class="ws">        </span>&#34;&#34;&#34;Dispatches the request and on top of that performs request</pre>
                            <pre
                                class="line after"><span class="ws">        </span>pre and postprocessing as well as HTTP exception catching and</pre>
                            <pre class="line after"><span class="ws">        </span>error handling.</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767753584">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\app.py"</cite>,
                            line <em class="line">90</em>,
                            in <code class="function">me</code></h4>
                        <div class="source ">
                            <pre
                                class="line before"><span class="ws">    </span>auth_header = request.headers.get(&#39;Authorization&#39;)</pre>
                            <pre class="line before"><span class="ws">    </span>if not auth_header:</pre>
                            <pre
                                class="line before"><span class="ws">        </span>return jsonify({&#39;error&#39;: &#39;Missing token&#39;}), 401</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">    </span>token = auth_header.split(&#34; &#34;)[-1]</pre>
                            <pre class="line current"><span class="ws">    </span>payload = decode_token(token)
<span class="ws">    </span>          ^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws">    </span>if not payload:</pre>
                            <pre
                                class="line after"><span class="ws">        </span>return jsonify({&#39;error&#39;: &#39;Invalid or expired token&#39;}), 401</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre
                                class="line after"><span class="ws">    </span>return jsonify({&#39;user_id&#39;: payload[&#39;sub&#39;], &#39;role&#39;: payload[&#39;role&#39;]})</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767753728">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\app.py"</cite>,
                            line <em class="line">43</em>,
                            in <code class="function">decode_token</code></h4>
                        <div class="source ">
                            <pre class="line before"><span class="ws">    </span>}</pre>
                            <pre
                                class="line before"><span class="ws">    </span>return jwt.encode(payload, app.config[&#39;SECRET_KEY&#39;], algorithm=&#39;HS256&#39;)</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre class="line before"><span class="ws"></span>def decode_token(token):</pre>
                            <pre class="line before"><span class="ws">    </span>try:</pre>
                            <pre class="line current"><span class="ws">        </span>payload = jwt.decode(token, app.config[&#39;SECRET_KEY&#39;], algorithms=[&#39;HS256&#39;])
<span class="ws">        </span>          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws">        </span>return payload</pre>
                            <pre class="line after"><span class="ws">    </span>except jwt.ExpiredSignatureError:</pre>
                            <pre class="line after"><span class="ws">        </span>return None</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre class="line after"><span class="ws"></span># --- ROUTES ---</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767753872">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py"</cite>,
                            line <em class="line">222</em>,
                            in <code class="function">decode</code></h4>
                        <div class="source library">
                            <pre
                                class="line before"><span class="ws">                </span>&#34;and will be removed in pyjwt version 3. &#34;</pre>
                            <pre
                                class="line before"><span class="ws">                </span>f&#34;Unsupported kwargs: {tuple(kwargs.keys())}&#34;,</pre>
                            <pre
                                class="line before"><span class="ws">                </span>RemovedInPyjwt3Warning,</pre>
                            <pre class="line before"><span class="ws">                </span>stacklevel=2,</pre>
                            <pre class="line before"><span class="ws">            </span>)</pre>
                            <pre class="line current"><span class="ws">        </span>decoded = self.decode_complete(
<span class="ws">        </span>          </pre>
                            <pre class="line after"><span class="ws">            </span>jwt,</pre>
                            <pre class="line after"><span class="ws">            </span>key,</pre>
                            <pre class="line after"><span class="ws">            </span>algorithms,</pre>
                            <pre class="line after"><span class="ws">            </span>options,</pre>
                            <pre class="line after"><span class="ws">            </span>verify=verify,</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767754448">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py"</cite>,
                            line <em class="line">167</em>,
                            in <code class="function">decode_complete</code></h4>
                        <div class="source library">
                            <pre class="line before"><span class="ws">        </span>)</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">        </span>payload = self._decode_payload(decoded)</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">        </span>merged_options = {**self.options, **options}</pre>
                            <pre class="line current"><span class="ws">        </span>self._validate_claims(
<span class="ws">        </span>^</pre>
                            <pre class="line after"><span class="ws">            </span>payload,</pre>
                            <pre class="line after"><span class="ws">            </span>merged_options,</pre>
                            <pre class="line after"><span class="ws">            </span>audience=audience,</pre>
                            <pre class="line after"><span class="ws">            </span>issuer=issuer,</pre>
                            <pre class="line after"><span class="ws">            </span>leeway=leeway,</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767754592">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py"</cite>,
                            line <em class="line">273</em>,
                            in <code class="function">_validate_claims</code></h4>
                        <div class="source library">
                            <pre class="line before"><span class="ws">            </span>self._validate_aud(</pre>
                            <pre
                                class="line before"><span class="ws">                </span>payload, audience, strict=options.get(&#34;strict_aud&#34;, False)</pre>
                            <pre class="line before"><span class="ws">            </span>)</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">        </span>if options[&#34;verify_sub&#34;]:</pre>
                            <pre class="line current"><span class="ws">            </span>self._validate_sub(payload, subject)
<span class="ws">            </span>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre
                                class="line after"><span class="ws">        </span>if options[&#34;verify_jti&#34;]:</pre>
                            <pre
                                class="line after"><span class="ws">            </span>self._validate_jti(payload)</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre class="line after"><span class="ws">    </span>def _validate_required_claims(</pre>
                        </div>
                    </div>

                <li>
                    <div class="frame" id="frame-2154767754736">
                        <h4>File
                            <cite class="filename">"C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py"</cite>,
                            line <em class="line">300</em>,
                            in <code class="function">_validate_sub</code></h4>
                        <div class="source library">
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">        </span>if &#34;sub&#34; not in payload:</pre>
                            <pre class="line before"><span class="ws">            </span>return</pre>
                            <pre class="line before"><span class="ws"></span> </pre>
                            <pre
                                class="line before"><span class="ws">        </span>if not isinstance(payload[&#34;sub&#34;], str):</pre>
                            <pre class="line current"><span class="ws">            </span>raise InvalidSubjectError(&#34;Subject must be a string&#34;)
<span class="ws">            </span>^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                            <pre class="line after"><span class="ws">        </span>if subject is not None:</pre>
                            <pre
                                class="line after"><span class="ws">            </span>if payload.get(&#34;sub&#34;) != subject:</pre>
                            <pre
                                class="line after"><span class="ws">                </span>raise InvalidSubjectError(&#34;Invalid subject&#34;)</pre>
                            <pre class="line after"><span class="ws"></span> </pre>
                        </div>
                    </div>
            </ul>
            <blockquote>jwt.exceptions.InvalidSubjectError: Subject must be a string
            </blockquote>
        </div>

        <div class="plain">
            <p>
                This is the Copy/Paste friendly version of the traceback.
            </p>
            <textarea cols="50" rows="10" name="code" readonly>Traceback (most recent call last):
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py&#34;, line 1536, in __call__
    return self.wsgi_app(environ, start_response)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py&#34;, line 1514, in wsgi_app
    response = self.handle_exception(e)
               ^^^^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask_cors\extension.py&#34;, line 176, in wrapped_function
    return cors_after_request(app.make_response(f(*args, **kwargs)))
                                                ^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py&#34;, line 1511, in wsgi_app
    response = self.full_dispatch_request()
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py&#34;, line 919, in full_dispatch_request
    rv = self.handle_user_exception(e)
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask_cors\extension.py&#34;, line 176, in wrapped_function
    return cors_after_request(app.make_response(f(*args, **kwargs)))
                                                ^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py&#34;, line 917, in full_dispatch_request
    rv = self.dispatch_request()
         ^^^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py&#34;, line 902, in dispatch_request
    return self.ensure_sync(self.view_functions[rule.endpoint])(**view_args)  # type: ignore[no-any-return]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\app.py&#34;, line 90, in me
    payload = decode_token(token)
              ^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\app.py&#34;, line 43, in decode_token
    payload = jwt.decode(token, app.config[&#39;SECRET_KEY&#39;], algorithms=[&#39;HS256&#39;])
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py&#34;, line 222, in decode
    decoded = self.decode_complete(
              ^^^^^^^^^^^^^^^^^^^^^
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py&#34;, line 167, in decode_complete
    self._validate_claims(
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py&#34;, line 273, in _validate_claims
    self._validate_sub(payload, subject)
  File &#34;C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py&#34;, line 300, in _validate_sub
    raise InvalidSubjectError(&#34;Subject must be a string&#34;)
jwt.exceptions.InvalidSubjectError: Subject must be a string
</textarea>
        </div>
        <div class="explanation">
            The debugger caught an exception in your WSGI application. You can now
            look at the traceback which led to the error. <span class="nojavascript">
  If you enable JavaScript you can also use additional features such as code
  execution (if the evalex feature is enabled), automatic pasting of the
  exceptions and much more.</span>
        </div>
        <div class="footer">
            Brought to you by <strong class="arthur">DON'T PANIC</strong>, your
            friendly Werkzeug powered traceback interpreter.
        </div>
    </div>

    <div class="pin-prompt">
        <div class="inner">
            <h3>Console Locked</h3>
            <p>
                The console is locked and needs to be unlocked by entering the PIN.
                You can find the PIN printed out on the standard output of your
                shell that runs the server.
            <form>
                <p>PIN:
                    <input type=text name=pin size=14>
                    <input type=submit name=btn value="Confirm Pin">
            </form>
        </div>
    </div>
</body>

</html>

<!--

Traceback (most recent call last):
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py", line 1536, in __call__
    return self.wsgi_app(environ, start_response)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py", line 1514, in wsgi_app
    response = self.handle_exception(e)
               ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask_cors\extension.py", line 176, in wrapped_function
    return cors_after_request(app.make_response(f(*args, **kwargs)))
                                                ^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py", line 1511, in wsgi_app
    response = self.full_dispatch_request()
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py", line 919, in full_dispatch_request
    rv = self.handle_user_exception(e)
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask_cors\extension.py", line 176, in wrapped_function
    return cors_after_request(app.make_response(f(*args, **kwargs)))
                                                ^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py", line 917, in full_dispatch_request
    rv = self.dispatch_request()
         ^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\flask\app.py", line 902, in dispatch_request
    return self.ensure_sync(self.view_functions[rule.endpoint])(**view_args)  # type: ignore[no-any-return]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\app.py", line 90, in me
    payload = decode_token(token)
              ^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\app.py", line 43, in decode_token
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py", line 222, in decode
    decoded = self.decode_complete(
              ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py", line 167, in decode_complete
    self._validate_claims(
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py", line 273, in _validate_claims
    self._validate_sub(payload, subject)
  File "C:\Users\talha\Downloads\Hard-core gym attendance\venv\Lib\site-packages\jwt\api_jwt.py", line 300, in _validate_sub
    raise InvalidSubjectError("Subject must be a string")
jwt.exceptions.InvalidSubjectError: Subject must be a string


-->