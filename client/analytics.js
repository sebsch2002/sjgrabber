// adapted google analytics tracking from
// https://github.com/blast-analytics-marketing/phonegap-google-universal-analytics

(function () {
    var f = void 0,
        h = !0,
        da = null,
        m = !1,
        aa = encodeURIComponent,
        ba = setTimeout,
        n = Math,
        ea = RegExp;

    function fa(a, b) {
        return a.name = b
    }
    var p = "push",
        Ub = "hash",
        ha = "slice",
        q = "data",
        r = "cookie",
        t = "indexOf",
        zc = "match",
        ia = "defaultValue",
        ja = "port",
        u = "createElement",
        ka = "referrer",
        v = "name",
        Ac = "getTime",
        x = "host",
        y = "length",
        z = "prototype",
        la = "clientWidth",
        A = "split",
        B = "location",
        ma = "hostname",
        Hc = "search",
        C = "call",
        E = "protocol",
        na = "clientHeight",
        Nc = "href",
        F = "substring",
        G = "apply",
        oa = "navigator",
        Oc = "parentNode",
        H = "join",
        I = "toLowerCase";
    var pa = new function () {
            var a = [];
            this.set = function (b) {
                a[b] = h
            };
            this.M = function () {
                for (var b = [], c = 0; c < a[y]; c++) a[c] && (b[n.floor(c / 6)] = b[n.floor(c / 6)] ^ 1 << c % 6);
                for (c = 0; c < b[y]; c++) b[c] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(b[c] || 0);
                return b[H]("") + "~"
            }
        };

    function J(a) {
        pa.set(a)
    };

    function K(a) {
        return "function" == typeof a
    }
    function qa(a) {
        return a != f && -1 < (a.constructor + "")[t]("String")
    }
    function ra() {
        return n.round(2147483647 * n.random())
    }
    function Ca(a) {
        var b = M[u]("img");
        b.width = 1;
        b.height = 1;
        b.src = a;
        return b
    }
    function L() {}
    function sa(a) {
        if (aa instanceof Function) return aa(a);
        J(28);
        return a
    }
    var ta = function (a, b, c, d) {
        try {
            a.addEventListener ? a.addEventListener(b, c, !! d) : a.attachEvent && a.attachEvent("on" + b, c)
        } catch (e) {
            J(27)
        }
    }, ua = function (a, b, c) {
            a.removeEventListener ? a.removeEventListener(b, c, m) : a.detachEvent && a.detachEvent("on" + b, c)
        };

    function eb() {
        var a = "" + M[B][ma];
        return 0 == a[t]("www.") ? a[F](4) : a
    }
    function va(a) {
        var b = M[B],
            b = b[E] + "//" + b[x];
        return !a && 0 == M[ka][t](b) ? "" : M[ka]
    }

    function wa(a, b) {
        if (1 == b[y] && b[0] != da && "object" === typeof b[0]) return b[0];
        for (var c = {}, d = n.min(a[y] + 1, b[y]), e = 0; e < d; e++) if ("object" === typeof b[e]) {
                for (var g in b[e]) b[e].hasOwnProperty(g) && (c[g] = b[e][g]);
                break
            } else e < a[y] && (c[a[e]] = b[e]);
        return c
    };
    var N = function () {
        this.keys = [];
        this.w = {};
        this.m = {}
    };
    N[z].set = function (a, b, c) {
        this.keys[p](a);
        c ? this.m[":" + a] = b : this.w[":" + a] = b
    };
    N[z].get = function (a) {
        var b = this.m[":" + a];
        b == f && (b = this.w[":" + a]);
        return b
    };
    N[z].map = function (a) {
        for (var b = 0; b < this.keys[y]; b++) {
            var c = this.keys[b],
                d = this.get(c);
            d && a(c, d)
        }
    };
    var O = window,
        M = document,
        xa = function (a) {
            var b = O._gaUserPrefs;
            return b && b.ioo && b.ioo() || a && O["ga-disable-" + a] === h
        }, fb = function (a) {
            ba(a, 100)
        }, ya = function (a) {
            var b = [],
                c = M[r][A](";");
            a = ea("^\\s*" + a + "=\\s*(.*?)\\s*$");
            for (var d = 0; d < c[y]; d++) {
                var e = c[d][zc](a);
                e && b[p](e[1])
            }
            return b
        }, za = ea(/^(www\.)?google(\.com?)?(\.[a-z]{2})?$/),
        Aa = ea(/(^|\.)doubleclick\.net$/i);
    var oc = function () {
        return (Ba || "https:" == M[B][E] ? "https:" : "http:") + "//www.google-analytics.com"
    }, Da = function (a) {
            fa(this, "len");
            this.message = a + "-8192"
        }, Ea = function (a) {
            fa(this, "ff2post");
            this.message = a + "-2036"
        }, Ga = function (a, b) {
            b = b || L;
            if (2036 >= a[y]) wc(a, b);
            else if (8192 >= a[y]) {
                var c = b;
                if (0 <= O[oa].userAgent[t]("Firefox") && ![].reduce) throw new Ea(a[y]);
                xc(a, c) || Fa(a, c)
            } else throw new Da(a[y]);
        }, wc = function (a, b) {
            var c = Ca(oc() + "/collect?" + a);
            c.onload = c.onerror = function () {
                c.onload = da;
                c.onerror = da;
                b()
            }
        }, xc = function (a, b) {
            var c, d = O.XDomainRequest;
            if (d) c = new d, c.open("POST", oc() + "/collect");
            else if (d = O.XMLHttpRequest) d = new d, "withCredentials" in d && (c = d, c.open("POST", oc() + "/collect", h), c.setRequestHeader("Content-Type", "text/plain"));
            if (c) return c.onreadystatechange = function () {
                    4 == c.readyState && (b(), c = da)
            }, c.send(a), h
        }, Fa = function (a, b) {
            if (M.body) {
                a = aa(a);
                try {
                    var c = M[u]('<iframe name="' + a + '"></iframe>')
                } catch (d) {
                    c = M[u]("iframe"), fa(c, a)
                }
                c.height = "0";
                c.width = "0";
                c.style.display = "none";
                c.style.visibility = "hidden";
                var e = M[B],
                    e = oc() + "/analytics_iframe.html#" + aa(e[E] + "//" + e[x] + "/favicon.ico"),
                    g = function () {
                        c.src = "";
                        c[Oc] && c[Oc].removeChild(c)
                    };
                ta(O, "beforeunload", g);
                var ca = m,
                    l = 0,
                    k = function () {
                        if (!ca) {
                            try {
                                if (9 < l || c.contentWindow[B][x] == M[B][x]) {
                                    ca = h;
                                    g();
                                    ua(O, "beforeunload", g);
                                    b();
                                    return
                                }
                            } catch (a) {}
                            l++;
                            ba(k, 200)
                        }
                    };
                ta(c, "load", k);
                M.body.appendChild(c);
                c.src = e
            } else fb(function () {
                    Fa(a, b)
                })
        };
    var Ha = function () {
        this.t = []
    };
    Ha[z].add = function (a) {
        this.t[p](a)
    };
    Ha[z].execute = function (a) {
        try {
            for (var b = 0; b < this.t[y]; b++) {
                var c = a.get(this.t[b]);
                !c || !K(c) || c[C](O, a)
            }
        } catch (d) {}
        b = a.get(Ia);
        b != L && K(b) && (a.set(Ia, L, h), ba(b, 10))
    };

    function Ja(a) {
        if (100 != a.get(Ka) && La(P(a, Q)) % 1E4 >= 100 * R(a, Ka)) throw "abort";
    }
    function Ma(a) {
        if (xa(P(a, Na))) throw "abort";
    }
    function Oa() {
        var a = M[B][E];
        //if ("http:" != a && "https:" != a) throw "abort";
    }

    function Pa(a) {
        var b = [];
        Qa.map(function (c, d) {
            if (d.p) {
                var e = a.get(c);
                if (!(e == f || e == d[ia]) && !(qa(e) && 0 == e[y])) "boolean" == typeof e && (e *= 1), b[p](d.p + "=" + sa("" + e))
            }
        });
        b[p]("z=" + ra());
        a.set(Ra, b[H]("&"), h)
    }
    function Sa(a) {
        Ga(P(a, Ra), a.get(Ia));
        a.set(Ia, L, h)
    };

    function Ta(a) {
        var b = R(a, Ua);
        500 <= b && J(15);
        var c = P(a, Va);
        if ("transaction" != c && "item" != c) {
            var c = R(a, Wa),
                d = (new Date)[Ac](),
                e = R(a, Xa);
            0 == e && a.set(Xa, d);
            e = n.round(2 * (d - e) / 1E3);
            0 < e && (c = n.min(c + e, 20), a.set(Xa, d));
            if (0 >= c) throw "abort";
            a.set(Wa, --c)
        }
        a.set(Ua, ++b)
    };
    var Ya = function () {
        this.data = new N
    }, Qa = new N,
        Za = [];
    Ya[z].get = function (a) {
        var b = $a(a),
            c = this[q].get(a);
        b && c == f && (c = K(b[ia]) ? b[ia]() : b[ia]);
        return b && b.n ? b.n(this, a, c) : c
    };
    var P = function (a, b) {
        var c = a.get(b);
        return c == f ? "" : "" + c
    }, R = function (a, b) {
            var c = a.get(b);
            return c == f || "" === c ? 0 : 1 * c
        };
    Ya[z].set = function (a, b, c) {
        if (a) if ("object" == typeof a) for (var d in a) a.hasOwnProperty(d) && ab(this, d, a[d], c);
            else ab(this, a, b, c)
    };
    var ab = function (a, b, c, d) {
        var e = $a(b);
        e && e.o ? e.o(a, b, c, d) : a[q].set(b, c, d)
    }, bb = function (a, b, c, d, e) {
            fa(this, a);
            this.p = b;
            this.n = d;
            this.o = e;
            this.defaultValue = c
        }, $a = function (a) {
            var b = Qa.get(a);
            if (!b) for (var c = 0; c < Za[y]; c++) {
                    var d = Za[c],
                        e = d[0].exec(a);
                    if (e) {
                        b = d[1](e);
                        Qa.set(b[v], b);
                        break
                    }
            }
            return b
        }, yc = function (a) {
            var b;
            Qa.map(function (c, d) {
                d.p == a && (b = d)
            });
            return b && b[v]
        }, S = function (a, b, c, d, e) {
            a = new bb(a, b, c, d, e);
            Qa.set(a[v], a);
            return a[v]
        }, cb = function (a, b) {
            Za[p]([ea("^" + a + "$"), b])
        }, T = function (a, b, c) {
            return S(a,
                b, c, f, db)
        }, db = function () {};
    var Pc;
    if (Pc = qa(window.GoogleAnalyticsObject)) {
        var Qc = window.GoogleAnalyticsObject;
        Pc = Qc ? Qc.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "") : ""
    }
    var gb = Pc || "ga",
        Ba = m,
        hb = T("apiVersion", "v"),
        ib = T("clientVersion", "_v");
    S("anonymizeIp", "aip");
    var jb = S("adSenseId", "a"),
        Va = S("hitType", "t"),
        Ia = S("hitCallback"),
        Ra = S("hitPayload");
    S("nonInteraction", "ni");
    S("sessionControl", "sc");
    S("queueTime", "qt");
    S("description", "cd");
    var kb = S("location", "dl"),
        lb = S("referrer", "dr", ""),
        mb = S("page", "dp", "");
    S("hostname", "dh");
    var nb = S("language", "ul"),
        ob = S("encoding", "de");
    S("title", "dt", function () {
        return M.title
    });
    cb("contentGroup([0-9]+)", function (a) {
        return new bb(a[0], "cg" + a[1])
    });
    var pb = S("screenColors", "sd"),
        qb = S("screenResolution", "sr"),
        rb = S("viewportSize", "vp"),
        sb = S("javaEnabled", "je"),
        tb = S("flashVersion", "fl");
    S("campaignId", "ci");
    S("campaignName", "cn");
    S("campaignSource", "cs");
    S("campaignMedium", "cm");
    S("campaignKeyword", "ck");
    S("campaignContent", "cc");
    var ub = S("eventCategory", "ec"),
        xb = S("eventAction", "ea"),
        yb = S("eventLabel", "el"),
        zb = S("eventValue", "ev"),
        Bb = S("socialNetwork", "sn"),
        Cb = S("socialAction", "sa"),
        Db = S("socialTarget", "st"),
        Eb = S("l1", "plt"),
        Fb = S("l2", "pdt"),
        Gb = S("l3", "dns"),
        Hb = S("l4", "rrt"),
        Ib = S("l5", "srt"),
        Jb = S("l6", "tcp"),
        Kb = S("l7", "dit"),
        Lb = S("l8", "clt"),
        Mb = S("timingCategory", "utc"),
        Nb = S("timingVar", "utv"),
        Ob = S("timingLabel", "utl"),
        Pb = S("timingValue", "utt");
    S("appName", "an");
    S("appVersion", "av");
    S("appId", "aid");
    S("appInstallerId", "aiid");
    S("exDescription", "exd");
    S("exFatal", "exf");
    var Rc = S("_utma", "_utma"),
        Sc = S("_utmz", "_utmz"),
        Tc = S("_utmht", "_utmht"),
        Ua = S("_hc", f, 0),
        Xa = S("_ti", f, 0),
        Wa = S("_to", f, 20);
    cb("dimension([0-9]+)", function (a) {
        return new bb(a[0], "cd" + a[1])
    });
    cb("metric([0-9]+)", function (a) {
        return new bb(a[0], "cm" + a[1])
    });
    S("linkerParam", f, f, Bc, db);
    S("usage", "_u", f, function () {
        return pa.M()
    }, db);
    S("forceSSL", f, f, function () {
        return Ba
    }, function (a, b, c) {
        Ba = !! c
    });
    cb("\\&(.*)", function (a) {
        var b = new bb(a[0], a[1]),
            c = yc(a[0][F](1));
        c && (b.n = function (a) {
            return a.get(c)
        }, b.o = function (a, b, g, ca) {
            a.set(c, g, ca)
        });
        return b
    });
    var Qb = T("optOutFilter"),
        Rb = S("protocolFilter"),
        Sb = S("storageCheckFilter"),
        Uc = S("historyFilter"),
        Tb = S("sampleRateFilter"),
        Vb = T("rateLimitFilter"),
        Wb = S("buildHitFilter"),
        Xb = S("sendHitFilter"),
        V = T("name"),
        Q = T("clientId", "cid"),
        Na = T("trackingId", "tid"),
        U = T("cookieName", f, "_ga"),
        W = T("cookieDomain"),
        Yb = T("cookiePath", f, "/"),
        Zb = T("cookieExpires", f, 63072E3),
        $b = T("legacyCookieDomain"),
        Vc = T("legacyHistoryImport", f, h),
        ac = T("storage", f, "cookie"),
        bc = T("allowLinker", f, m),
        cc = T("allowAnchor", f, h),
        Ka = T("sampleRate",
            "sf", 100),
        dc = T("siteSpeedSampleRate", f, 1),
        ec = T("alwaysSendReferrer", f, m);

    function Cc() {
        var a = $;
        X("create", a, a.create, 3);
        X("getByName", a, a.j, 5);
        X("getAll", a, a.K, 6);
        a = pc[z];
        X("get", a, a.get, 7);
        X("set", a, a.set, 4);
        X("send", a, a.send, 2);
        a = Ya[z];
        X("get", a, a.get);
        X("set", a, a.set);
        (O.gaplugins = O.gaplugins || {}).Linker = Dc;
        a = Dc[z];
        Z.C("linker", Dc);
        X("decorate", a, a.Q, 20);
        X("autoLink", a, a.S, 25)
    }

    function X(a, b, c, d) {
        b[a] = function () {
            try {
                return d && J(d), c[G](this, arguments)
            } catch (b) {
                var g = b && b[v];
                if (!(1 <= 100 * n.random())) {
                    var ca = ["t=error", "_e=exc", "_v=j8", "sr=1"];
                    a && ca[p]("_f=" + a);
                    g && ca[p]("_m=" + sa(g[F](0, 100)));
                    ca[p]("aip=1");
                    ca[p]("z=" + ra());
                    Ga(ca[H]("&"))
                }
                throw b;
            }
        }
    };

    function fc() {
        var a, b, c;
        if ((c = (c = O[oa]) ? c.plugins : da) && c[y]) for (var d = 0; d < c[y] && !b; d++) {
                var e = c[d]; - 1 < e[v][t]("Shockwave Flash") && (b = e.description)
        }
        if (!b) try {
                a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"), b = a.GetVariable("$version")
        } catch (g) {}
        if (!b) try {
                a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"), b = "WIN 6,0,21,0", a.AllowScriptAccess = "always", b = a.GetVariable("$version")
        } catch (ca) {}
        if (!b) try {
                a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"), b = a.GetVariable("$version")
        } catch (l) {}
        b &&
            (a = b[zc](/[\d]+/g)) && 3 <= a[y] && (b = a[0] + "." + a[1] + " r" + a[2]);
        return b || ""
    };
    var gc = function (a, b) {
        var c = n.min(R(a, dc), 100);
        if (!(La(P(a, Q)) % 100 >= c) && (c = {}, Ec(c) || Fc(c))) {
            var d = c[Eb];
            d == f || (Infinity == d || isNaN(d)) || (0 < d ? (Y(c, Gb), Y(c, Jb), Y(c, Ib), Y(c, Fb), Y(c, Hb), Y(c, Kb), Y(c, Lb), b(c)) : ta(O, "load", function () {
                gc(a, b)
            }, m))
        }
    }, Ec = function (a) {
            var b = O.performance || O.webkitPerformance,
                b = b && b.timing;
            if (!b) return m;
            var c = b.navigationStart;
            if (0 == c) return m;
            a[Eb] = b.loadEventStart - c;
            a[Gb] = b.domainLookupEnd - b.domainLookupStart;
            a[Jb] = b.connectEnd - b.connectStart;
            a[Ib] = b.responseStart - b.requestStart;
            a[Fb] = b.responseEnd - b.responseStart;
            a[Hb] = b.fetchStart - c;
            a[Kb] = b.domInteractive - c;
            a[Lb] = b.domContentLoadedEventStart - c;
            return h
        }, Fc = function (a) {
            if (O.top != O) return m;
            var b = O.external,
                c = b && b.onloadT;
            b && !b.isValidLoadTime && (c = f);
            2147483648 < c && (c = f);
            0 < c && b.setPageReadyTime();
            if (c == f) return m;
            a[Eb] = c;
            return h
        }, Y = function (a, b) {
            var c = a[b];
            if (isNaN(c) || Infinity == c || 0 > c) a[b] = f
        };
    var hc = m,
        mc = function (a) {
            if ("cookie" == P(a, ac)) {
                var b = P(a, U),
                    c, d;
                d = P(a, Q);
                d = sa(d).replace(/\(/g, "%28").replace(/\)/g, "%29");
                var e = ic(P(a, W)),
                    g = jc(P(a, Yb));
                1 < g && (e += "-" + g);
                c = ["1", e, d][H](".");
                g = kc(P(a, Yb));
                d = lc(P(a, W));
                e = 1E3 * R(a, Zb);
                a = P(a, Na);
                a = xa(a) ? m : Aa.test(M[B][ma]) || "/" == g && za.test(d) ? m : h;
                if (a) {
                    if ((a = c) && 200 < a[y]) a = a[F](0, 200), J(24);
                    b = b + "=" + a + "; path=" + g + "; ";
                    e && (b += "expires=" + (new Date((new Date)[Ac]() + e)).toGMTString() + "; ");
                    d && "none" != d && (b += "domain=" + d + ";");
                    d = M[r];
                    M.cookie = b;
                    b = d != M[r]
                } else b =
                        m;
                b && (hc = h)
            }
        }, nc = function (a) {
            if ("cookie" == P(a, ac) && !hc && (mc(a), !hc)) throw "abort";
        }, Xc = function (a) {
            if (a.get(Vc)) {
                var b = P(a, W),
                    c = P(a, $b) || eb(),
                    d = Wc("__utma", c, b);
                d && (J(19), a.set(Tc, (new Date)[Ac](), h), a.set(Rc, d.R), (b = Wc("__utmz", c, b)) && d[Ub] == b[Ub] && a.set(Sc, b.R))
            }
        }, Gc = function (a, b, c) {
            for (var d = [], e = [], g, ca = 0; ca < a[y]; ca++) {
                var l = a[ca];
                if (l.r[c] == b) d[p](l);
                else g == f || l.r[c] < g ? (e = [l], g = l.r[c]) : l.r[c] == g && e[p](l)
            }
            return 0 < d[y] ? d : e
        }, lc = function (a) {
            return 0 == a[t](".") ? a.substr(1) : a
        }, ic = function (a) {
            return lc(a)[A](".")[y]
        },
        kc = function (a) {
            if (!a) return "/";
            1 < a[y] && a.lastIndexOf("/") == a[y] - 1 && (a = a.substr(0, a[y] - 1));
            0 != a[t]("/") && (a = "/" + a);
            return a
        }, jc = function (a) {
            a = kc(a);
            return "/" == a ? 1 : a[A]("/")[y]
        };

    function Wc(a, b, c) {
        "none" == b && (b = "");
        var d = [],
            e = ya(a);
        a = "__utma" == a ? 6 : 2;
        for (var g = 0; g < e[y]; g++) {
            var ca = ("" + e[g])[A](".");
            ca[y] >= a && d[p]({
                hash: ca[0],
                R: e[g],
                O: ca
            })
        }
        return 0 == d[y] ? f : 1 == d[y] ? d[0] : Yc(b, d) || Yc(c, d) || Yc(da, d) || d[0]
    }
    function Yc(a, b) {
        var c, d;
        a == da ? c = d = 1 : (c = La(a), d = La(0 == a[t](".") ? a[F](1) : "." + a));
        for (var e = 0; e < b[y]; e++) if (b[e][Ub] == c || b[e][Ub] == d) return b[e]
    };

    function Bc(a) {
        a = a.get(Q);
        var b = Ic(a, 0);
        return "_ga=1." + sa(b + "." + a)
    }
    function Ic(a, b) {
        for (var c = new Date, d = O.screen || {}, e = O[oa], g = e.plugins || [], c = [a, e.userAgent, d.width, d.height, c.getTimezoneOffset(), c.getYear(), c.getDate(), c.getHours(), c.getMinutes() + b], d = 0; d < g[y]; ++d) c[p](g[d].description);
        return La(c[H]("."))
    }
    var Dc = function (a) {
        this.target = a
    };
    Dc[z].Q = function (a, b) {
        var c = /(.*)([?&#])(?:_ga=[^&]*)(?:&?)(.*)/.exec(a);
        c && 3 <= c[y] && (a = c[1] + (c[3] ? c[2] + c[3] : ""));
        var c = this.target.get("linkerParam"),
            d = a[t]("?"),
            e = a[t]("#");
        b ? a += (-1 == e ? "#" : "&") + c : (d = -1 == d ? "?" : "&", a = -1 == e ? a + (d + c) : a[F](0, e) + d + c + a[F](e));
        return a
    };
    Dc[z].S = function (a, b) {
        function c(c) {
            try {
                c = c || O.event;
                var g;
                t: {
                    var ca = c.target || c.srcElement;
                    for (c = 100; ca && 0 < c;) {
                        if (ca[Nc] && ca.nodeName[zc](/^a(?:rea)?$/i)) {
                            g = ca;
                            break t
                        }
                        ca = ca[Oc];
                        c--
                    }
                    g = {}
                }
                if (!("http:" != g[E] && "https:" != g[E])) {
                    var l;
                    t: {
                        var k = g[ma] || "";
                        if (k != M[B][ma]) for (ca = 0; ca < a[y]; ca++) if (0 <= k[t](a[ca])) {
                                    l = h;
                                    break t
                                }
                        l = m
                    }
                    l && (g.href = d.Q(g[Nc], b))
                }
            } catch (w) {
                J(26)
            }
        }
        var d = this;
        ta(M, "mousedown", c, m);
        ta(M, "touchstart", c, m);
        ta(M, "keyup", c, m)
    };

    function Zc() {
        var a = O.gaGlobal = O.gaGlobal || {};
        return a.hid = a.hid || ra()
    };
    var pc = function (a) {
        function b(a, c) {
            d.b[q].set(a, c)
        }
        function c(a, c) {
            b(a, c);
            d.filters.add(a)
        }
        var d = this;
        this.b = new Ya;
        this.filters = new Ha;
        b(V, a[V]);
        b(Na, a[Na]);
        b(U, a[U]);
        b(W, a[W] || eb());
        b(Yb, a[Yb]);
        b(Zb, a[Zb]);
        b($b, a[$b]);
        b(Vc, a[Vc]);
        b(bc, a[bc]);
        b(cc, a[cc]);
        b(Ka, a[Ka]);
        b(dc, a[dc]);
        b(ec, a[ec]);
        b(ac, a[ac]);
        b(hb, 1);
        b(ib, "j8");
        c(Qb, Ma);
        c(Rb, Oa);
        c(Sb, nc);
        c(Uc, Xc);
        c(Tb, Ja);
        c(Vb, Ta);
        c(Wb, Pa);
        c(Xb, Sa);
        Jc(this.b, a[Q]);
        Kc(this.b);
        this.b.set(jb, Zc())
    }, Jc = function (a, b) {
            if ("cookie" == P(a, ac)) {
                hc = m;
                var c;
                e: {
                    var d =
                        ya(P(a, U));
                    if (d && !(1 > d[y])) {
                        c = [];
                        for (var e = 0; e < d[y]; e++) {
                            var g;
                            g = d[e][A](".");
                            var ca = g.shift();
                            ("GA1" == ca || "1" == ca) && 1 < g[y] ? (ca = g.shift()[A]("-"), 1 == ca[y] && (ca[1] = "1"), ca[0] *= 1, ca[1] *= 1, g = {
                                r: ca,
                                s: g[H](".")
                            }) : g = f;
                            g && c[p](g)
                        }
                        if (1 == c[y]) {
                            J(13);
                            c = c[0].s;
                            break e
                        }
                        if (0 == c[y]) J(12);
                        else {
                            J(14);
                            d = ic(P(a, W));
                            c = Gc(c, d, 0);
                            if (1 == c[y]) {
                                c = c[0].s;
                                break e
                            }
                            d = jc(P(a, Yb));
                            c = Gc(c, d, 1);
                            c = c[0] && c[0].s;
                            break e
                        }
                    }
                    c = f
                }
                c || (c = P(a, W), d = P(a, $b) || eb(), c = Wc("__utma", d, c), (c = c == f ? f : c.O[1] + "." + c.O[2]) && J(10));
                c && (a[q].set(Q, c), hc = h)
            }
            if (e =
                (c = M[B][Nc][zc]("(?:&|\\?)_ga=([^&]*)")) && 2 == c[y] ? c[1] : "") a.get(bc) ? (c = e[t]("."), -1 == c ? J(22) : (d = e[F](c + 1), "1" != e[F](0, c) ? J(22) : (c = d[t]("."), -1 == c ? J(22) : (e = d[F](0, c), c = d[F](c + 1), e != Ic(c, 0) && e != Ic(c, -1) && e != Ic(c, -2) ? J(23) : (J(11), a[q].set(Q, c)))))) : J(21);
            b && (J(9), a[q].set(Q, sa(b)));
            if (!a.get(Q)) if (c = (c = O.gaGlobal && O.gaGlobal.vid) && -1 != c[Hc](/^(?:utma\.)?\d+\.\d+$/) ? c : f) J(17), a[q].set(Q, c);
                else {
                    J(8);
                    c = O[oa];
                    c = c.appName + c.version + c.platform + c.userAgent + (M[r] ? M[r] : "") + (M[ka] ? M[ka] : "");
                    d = c[y];
                    for (e = O.history[y]; 0 <
                        e;) c += e-- ^ d++;
                    a[q].set(Q, [ra() ^ La(c) & 2147483647, n.round((new Date)[Ac]() / 1E3)][H]("."))
                }
            mc(a)
        }, Kc = function (a) {
            var b = O[oa],
                c = O.screen,
                d = M[B];
            a.set(lb, va(a.get(ec)));
            d && a.set(kb, d[E] + "//" + d[ma] + d.pathname + d[Hc]);
            c && a.set(qb, c.width + "x" + c.height);
            c && a.set(pb, c.colorDepth + "-bit");
            var c = M.documentElement,
                e = M.body,
                g = e && e[la] && e[na],
                ca = [];
            c && (c[la] && c[na]) && ("CSS1Compat" === M.compatMode || !g) ? ca = [c[la], c[na]] : g && (ca = [e[la], e[na]]);
            c = 0 >= ca[0] || 0 >= ca[1] ? "" : ca[H]("x");
            a.set(rb, c);
            a.set(tb, fc());
            a.set(ob, M.characterSet ||
                M.charset);
            //a.set(sb, b && "function" === typeof b.javaEnabled && b.javaEnabled() || m);
            a.set(nb, (b && (b.language || b.browserLanguage) || "")[I]());
            if (d && a.get(cc) && (b = M[B][Ub])) {
                b = b[F](1);
                b = b[A]("&");
                d = [];
                for (c = 0; c < b[y]; ++c)(0 == b[c][t]("utm_id") || 0 == b[c][t]("utm_campaign") || 0 == b[c][t]("utm_source") || 0 == b[c][t]("utm_medium") || 0 == b[c][t]("utm_term") || 0 == b[c][t]("utm_content")) && d[p](b[c]);
                0 < d[y] && (b = "#" + d[H]("&"), a.set(kb, a.get(kb) + b))
            }
        };
    pc[z].get = function (a) {
        return this.b.get(a)
    };
    pc[z].set = function (a, b) {
        this.b.set(a, b)
    };
    var qc = {
        pageview: [mb],
        event: [ub, xb, yb, zb],
        social: [Bb, Cb, Db],
        timing: [Mb, Nb, Pb, Ob]
    };
    pc[z].send = function (a) {
        if (!(1 > arguments[y])) {
            var b, c;
            "string" === typeof arguments[0] ? (b = arguments[0], c = [][ha][C](arguments, 1)) : (b = arguments[0] && arguments[0][Va], c = arguments);
            b && (c = wa(qc[b] || [], c), c[Va] = b, this.b.set(c, f, h), this.filters.execute(this.b), "pageview" == b && Lc(this), this.b[q].m = {})
        }
    };
    var Lc = function (a) {
        a.I || (a.I = h, gc(a.b, function (b) {
            a.send("timing", b)
        }))
    };
    var rc = function (a) {
        if ("prerender" == M.webkitVisibilityState) return m;
        a();
        return h
    }, Mc = function (a) {
            if (!rc(a)) {
                J(16);
                var b = m,
                    c = function () {
                        !b && rc(a) && (b = h, ua(M, "webkitvisibilitychange", c))
                    };
                ta(M, "webkitvisibilitychange", c)
            }
        };
    var Z = {
        F: "/plugins/ua/",
        D: /^(?:(\w+)\.)?(?:(\w+):)?(\w+)$/
    };
    Z.k = new N;
    Z.f = [];
    var sc = function (a) {
        if (K(a[0])) this.u = a[0];
        else {
            var b = Z.D.exec(a[0]);
            b != da && 4 == b[y] && (this.c = b[1] || "t0", this.e = b[2] || "", this.d = b[3], this.a = [][ha][C](a, 1), this.e || (this.A = "create" == this.d, this.i = "require" == this.d, this.g = "provide" == this.d));
            if (!K(a[0])) {
                b = a[1];
                a = a[2];
                if (!this.d) throw "abort";
                if (this.i && (!qa(b) || "" == b)) throw "abort";
                if (this.g && (!qa(b) || "" == b || !K(a))) throw "abort";
                if (0 <= this.c[t](".") || 0 <= this.c[t](":") || 0 <= this.e[t](".") || 0 <= this.e[t](":")) throw "abort";
                if (this.g && "t0" != this.c) throw "abort";
            }
        }
    };
    Z.B = function (a, b, c) {
        var d = Z.k.get(a);
        if (!K(d)) return m;
        b.plugins_ = b.plugins_ || new N;
        b.plugins_.set(a, new d(b, c || {}));
        return h
    };
    Z.C = function (a, b) {
        Z.k.set(a, b)
    };
    Z.execute = function (a) {
        var b = Z.J[G](Z, arguments),
            b = Z.f.concat(b);
        for (Z.f = []; 0 < b[y] && !Z.v(b[0]) && !(b.shift(), 0 < Z.f[y]););
        Z.f = Z.f.concat(b)
    };
    Z.J = function (a) {
        for (var b = [], c = 0; c < arguments[y]; c++) try {
                var d = new sc(arguments[c]);
                if (d.g) Z.v(d);
                else {
                    if (d.i) {
                        var e = d.a[1];
                        if (!K(Z.k.get(d.a[0])) && !d.H && e) {
                            var g = e + "",
                                e = g && 0 <= g[t]("/") ? g : "//www.google-analytics.com" + Z.F + g;
                            var ca = tc("" + e),
                                l;
                            var k = ca[E],
                                w = M[B][E];
                            l = "https:" == k || k == w ? h : "http:" != k ? m : "http:" == w;
                            var s;
                            if (s = l) {
                                var g = ca,
                                    D = tc(M[B][Nc]);
                                if (g.G || 0 <= g.url[t]("?") || 0 <= g.path[t]("://")) s = m;
                                else if (g[x] == D[x] && g[ja] == D[ja]) s = h;
                                else {
                                    var vb = "http:" == g[E] ? 80 : 443;
                                    s = "www.google-analytics.com" == g[x] &&
                                        (g[ja] || vb) == vb && 0 == g.path[t]("/plugins/") ? h : m
                                }
                            }
                            if (s) {
                                var g = d,
                                    wb = ca.url;
                                if (wb) {
                                    var ga = M[u]("script");
                                    ga.type = "text/javascript";
                                    ga.async = h;
                                    ga.src = wb;
                                    ga.id = f;
                                    var Ab = M.getElementsByTagName("script")[0];
                                    Ab[Oc].insertBefore(ga, Ab)
                                }
                                g.H = m
                            }
                        }
                    }
                    b[p](d)
                }
        } catch (vc) {}
        return b
    };
    Z.v = function (a) {
        try {
            if (a.u) a.u[C](O, $.j("t0"));
            else if (a.g) Z.C(a.a[0], a.a[1]);
            else {
                var b = a.c == gb ? $ : $.j(a.c);
                if (a.A) "t0" == a.c && $.create(a.a[0], a.a[1]);
                else if (b) if (a.i) {
                        if (!Z.B(a.a[0], b, a.a[2])) return h
                    } else a.e && (b = b.plugins_.get(a.e)), b[a.d][G](b, a.a)
            }
        } catch (c) {}
    };

    function tc(a) {
        function b(a) {
            var c = (a[ma] || "")[A](":")[0][I](),
                b = (a[E] || "")[I](),
                b = 1 * a[ja] || ("http:" == b ? 80 : "https:" == b ? 443 : "");
            a = a.pathname || "";
            0 == a[t]("/") || (a = "/" + a);
            return [c, "" + b, a]
        }
        var c = M[u]("a");
        c.href = M[B][Nc];
        var d = (c[E] || "")[I](),
            e = b(c),
            g = c[Hc] || "",
            ca = d + "//" + e[0] + (e[1] ? ":" + e[1] : "");
        0 == a[t]("//") ? a = d + a : 0 == a[t]("/") ? a = ca + a : !a || 0 == a[t]("?") ? a = ca + e[2] + (a || g) : 0 > a[A]("/")[0][t](":") && (a = ca + e[2][F](0, e[2].lastIndexOf("/")) + "/" + a);
        c.href = a;
        d = b(c);
        return {
            protocol: (c[E] || "")[I](),
            host: d[0],
            port: d[1],
            path: d[2],
            G: c[Hc] || "",
            url: a || ""
        }
    };
    var $ = function (a) {
        J(1);
        Z.execute[G](Z, [arguments])
    };
    $.h = {};
    $.P = [];
    $.L = 0;
    $.answer = 42;
    var uc = [Na, W, V];
    $.create = function (a) {
        var b = wa(uc, [][ha][C](arguments));
        b[V] || (b[V] = "t0");
        var c = "" + b[V];
        if ($.h[c]) return $.h[c];
        b = new pc(b);
        $.h[c] = b;
        $.P[p](b);
        return b
    };
    $.j = function (a) {
        return $.h[a]
    };
    $.K = function () {
        return $.P[ha](0)
    };
    $.N = function () {
        var a = O[gb];
        if (!(a && 42 == a.answer)) {
            $.L = a && a.l;
            $.loaded = h;
            O[gb] = $;
            Cc();
            var b = a && a.q;
            "[object Array]" == Object[z].toString[C](Object(b)) && Mc(function () {
                Z.execute[G]($, b)
            })
        }
    };
    $.N();

    function La(a) {
        var b = 1,
            c = 0,
            d;
        if (a) {
            b = 0;
            for (d = a[y] - 1; 0 <= d; d--) c = a.charCodeAt(d), b = (b << 6 & 268435455) + c + (c << 14), c = b & 266338304, b = 0 != c ? b ^ c >> 21 : b
        }
        return b
    };
})(window);