(this["webpackJsonpjobz-web"]=this["webpackJsonpjobz-web"]||[]).push([[0],{162:function(e,t,n){},171:function(e,t,n){"use strict";n.r(t);var i,r=n(50),a=n.n(r),s=n(57),c=n(70),o=n(0),l=n(29),d=n.n(l),h=(n(161),n(162),n(143)),j=n(130),u=n(118),b=n(46),p=n(47),f=n(49),g=n(48),y=n(74),x=n(45),m=n(187),O=n(189),v=n(142),w=n(186),k=n(191),T=n(185),S=n(192),C=n(84),z=n(146),I=n(107),E=n(195),P=n(196),J=n(14),D=n.n(J),R=n(5),W=function(e){Object(f.a)(n,e);var t=Object(g.a)(n);function n(){var e;Object(b.a)(this,n);for(var i=arguments.length,r=new Array(i),a=0;a<i;a++)r[a]=arguments[a];return(e=t.call.apply(t,[this].concat(r))).state={error:null,errorInfo:null},e}return Object(p.a)(n,[{key:"componentDidCatch",value:function(e,t){this.setState({error:e,errorInfo:t})}},{key:"render",value:function(){var e=this.state,t=e.error,n=void 0===t?{}:t,i=e.errorInfo,r=void 0===i?{}:i;return n?(alert(n.message),Object(R.jsxs)(w.a,{children:[Object(R.jsx)("div",{children:n.message}),r&&Object(R.jsx)(k.a,{bordered:!1,children:Object(R.jsx)(k.a.Panel,{header:"Details",children:JSON.stringify(r.componentStack,null,"\t")},"1")})]})):this.props.children}}]),n}(o.Component),A=function(e){Object(f.a)(n,e);var t=Object(g.a)(n);function n(){return Object(b.a)(this,n),t.apply(this,arguments)}return Object(p.a)(n,[{key:"render",value:function(){var e=this.props,t=e.active,n=e.height,i=void 0===n?0:n,r=e.children,a=e.peek;return Object(R.jsx)("div",{style:{height:t?null:i},children:t?r:a})}}]),n}(o.Component),F=function(e){Object(f.a)(n,e);var t=Object(g.a)(n);function n(){return Object(b.a)(this,n),t.apply(this,arguments)}return Object(p.a)(n,[{key:"render",value:function(){var e=this.props,t=e.icon,n=e.onClick,i=e.children;return Object(R.jsx)(v.a,{onClick:function(){return n&&n()},type:"default",shape:"round",size:"small",icon:t,children:i})}}]),n}(o.Component),L=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Z=function(e){Object(f.a)(n,e);var t=Object(g.a)(n);function n(){var e;Object(b.a)(this,n);for(var i=arguments.length,r=new Array(i),a=0;a<i;a++)r[a]=arguments[a];return(e=t.call.apply(t,[this].concat(r))).state={search:"",tags:[],activeProfiles:[]},e}return Object(p.a)(n,[{key:"render",value:function(){var e=this,t=this.state,n=t.loading,i=t.search,r=t.tags,a=this.getWindowDimensions().width<=576;return Object(R.jsxs)(R.Fragment,{children:[Object(R.jsxs)(y.a,{gutter:[20,20],align:"middle",justify:a?"center":"start",children:[Object(R.jsx)(x.a,{sm:7,style:{whiteSpace:"pre-wrap"},children:Object(R.jsx)("img",{style:{width:150,height:150,borderRadius:20},src:"https://lh3.googleusercontent.com/pw/ACtC-3dYqzXbdX5S7B3EuxIHUgBJKgD37ZhxrXQ-Jo5U2Kio3sRNF9vhR_tVxURXlPZO26ItIsiBxGrfZWV9Wwgooz9z-lNOTUmG2kIg91mDkpEoLSXU3ikFLn3XE3UmTxbdQOayn016bVZb5IlUsr3ZzTuNJQ=s512-no?authuser=0"})}),Object(R.jsxs)(x.a,{sm:14,children:[Object(R.jsx)(m.a.Title,{level:1,style:{color:"white",marginBottom:0},children:"Job Z"}),Object(R.jsx)(m.a.Title,{level:4,style:{color:"white",marginTop:0,marginBottom:0},children:"Be Discovered"})]})]}),Object(R.jsx)(y.a,{children:Object(R.jsx)(x.a,{style:{display:"flex",flexDirection:"row",overflowX:"auto",borderRadius:D.a.size(r)>0?20:0,marginTop:40},children:this.renderSearchTags()})}),Object(R.jsx)(y.a,{children:Object(R.jsx)(O.a,{size:"large",bordered:!1,style:{backgroundColor:"white",marginTop:10,borderRadius:20},value:i,loading:n,suffix:n?Object(R.jsx)(C.a,{}):Object(R.jsx)(z.a,{}),placeholder:["Waitress, Bartender, DJ","App Developer, QA, Beta Tester","Photographer, Makeup Artist, Influencer"][Math.floor(3*Math.random())],onChange:function(t){var n=t.target.value;return e.setState({search:n},(function(){return","===n.slice(-1)&&e.addTag(n.slice(0,-1))}))},onPressEnter:function(t){var n=t.target.value;return e.setState({search:"",loading:!0},(function(){return e.addTag(n)}))}})}),Object(R.jsx)(y.a,{children:Object(R.jsxs)(x.a,{style:{borderTopLeftRadius:20,borderTopRightRadius:20,marginTop:10},children:[this.renderProfiles(),Object(R.jsx)("div",{style:{marginBottom:50,whiteSpace:"pre-wrap"},children:Object(R.jsxs)(m.a.Text,{style:{color:"white"},children:["There are currently 3 profiles tagged with ",Object(R.jsx)(F,{onClick:function(){return e.setState({loading:!0},(function(){return e.addTag("Photographer")}))},children:"Photographer"})," ",Object(R.jsx)(F,{onClick:function(){return e.setState({loading:!0},(function(){return e.addTag("Developer")}))},children:"Developer"})," ",Object(R.jsx)(F,{onClick:function(){return e.setState({loading:!0},(function(){return e.addTag("Doge")}))},children:"Doge"})]})})]})})]})}},{key:"renderSearchTags",value:function(){var e=this,t=this.state,n=t.tags;t.profiles,t.filter;return D.a.size(n)>0?D.a.map(n,(function(t){return Object(R.jsx)(v.a,{onClick:function(){return e.removeTag(t)},type:"default",shape:"round",icon:Object(R.jsx)(I.a,{}),style:{marginRight:5},children:t},t)})):Object(R.jsxs)("div",{children:[Object(R.jsx)(v.a,{style:{width:0,paddingLeft:0,paddingRight:0,border:"none"}}),Object(R.jsxs)(m.a.Text,{style:{color:"white"},children:["Search profiles by tags separated by comma or ",Object(R.jsx)(m.a.Text,{code:!0,style:{color:"white"},children:"Enter"})," key."]})]})}},{key:"addTag",value:function(){var e=Object(c.a)(a.a.mark((function e(t){var n,i,r,s=this;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=this.state.tags,!D.a.isEmpty(t)){e.next=3;break}return e.abrupt("return");case 3:t=D.a.toLower(D.a.trim(t)),i=function(){clearTimeout(s.timeout),s.timeout=D.a.size(r)>0&&setTimeout((function(){return s.search()}),500)},r=D()(n).filter((function(e){return e!==t})).concat(t).value(),this.setState({tags:r,search:""},(function(){return i()}));case 7:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"removeTag",value:function(){var e=Object(c.a)(a.a.mark((function e(t){var n,i,r,s,c,o=this;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:n=this.state,i=n.tags,r=n.profiles,s=D.a.filter(i,(function(e){return e!==t})),c=function(){clearTimeout(o.timeout),o.timeout=D.a.size(s)>0&&setTimeout((function(){return o.search()}),500)},this.setState({tags:s,profiles:s.length>0?r:[]},(function(){return c()}));case 4:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"renderProfiles",value:function(){var e=this,t=this.state,n=t.tags,i=t.profiles,r=t.activeProfiles,a=t.loading,s=function(t){return e.setState({activeProfiles:D.a.filter(r,(function(e){return e!==t.id}))})},c=function(t){return e.setState({activeProfiles:[].concat(Object(u.a)(r),[t.id])})};return D.a.isEmpty(n)?null:D.a.isEmpty(i)&&!a?Object(R.jsxs)("div",{style:{marginTop:20},children:[Object(R.jsx)("h2",{style:{color:"white"},children:D.a.size(n)>0&&!a?"Nothing Here":""}),Object(R.jsx)("p",{style:{color:"white"},children:D.a.size(n)>0&&!a?"No profiles with specified tags":""})]}):D.a.map(i,(function(t,n){var o=D.a.indexOf(r,t.id)>-1;return Object(R.jsxs)(w.a,{bordered:!1,style:{opacity:a?.33:1,whiteSpace:"pre-wrap",borderRadius:20,marginBottom:n<D.a.size(i)-1?10:50,overflow:"hidden"},headStyle:{whiteSpace:"pre-wrap"},bodyStyle:{padding:0},actions:o?[Object(R.jsx)(E.a,{onClick:function(){return o?s(t):c(t)}})]:[],children:[D.a.size(t.portfolio)>0?Object(R.jsxs)("div",{onClick:function(){return o?s(t):c(t)},style:{position:"relative",display:"flex",overflowY:"auto",cursor:"pointer"},children:[Object(R.jsx)("img",{src:"https://firebasestorage.googleapis.com/v0/b/job-z-e3be0.appspot.com/o/".concat(t.portfolio[0],"?alt=media"),style:{width:"100%",height:250,objectFit:"cover"}}),Object(R.jsxs)("div",{style:{position:"absolute",bottom:0,height:250,width:"100%",padding:20,display:"flex",justifyContent:"space-between",flexDirection:"column",overflowY:"auto",background:"linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))"},children:[Object(R.jsx)("div",{}),Object(R.jsxs)("div",{children:[Object(R.jsx)(m.a.Title,{level:4,style:{color:"white"},children:t.description}),Object(R.jsx)(m.a.Text,{style:{color:"white"},children:D.a.map(t.workExperiences,(function(e,t){return Object(R.jsxs)("span",{children:[D.a.isFinite(e.years)?"".concat(e.years," years at "):"",Object(R.jsx)("b",{children:e.name}),"\n"]})}))}),Object(R.jsx)(m.a.Text,{style:{color:"white"},children:D.a.map(t.educationExperiences,(function(e,t){return Object(R.jsxs)("span",{children:[D.a.isFinite(e.years)?"".concat(e.years," years at "):"",Object(R.jsx)("b",{children:e.name}),"\n"]})}))})]})]})]}):Object(R.jsxs)("div",{onClick:function(){return o?s(t):c(t)},style:{margin:20},children:[Object(R.jsx)(m.a.Title,{level:4,children:t.description}),Object(R.jsx)(m.a.Text,{children:D.a.map(t.workExperiences,(function(e,t){return Object(R.jsxs)("span",{children:[D.a.isFinite(e.years)?"".concat(e.years," years at "):"",Object(R.jsx)("b",{children:e.name}),"\n"]})}))}),Object(R.jsx)(m.a.Text,{children:D.a.map(t.educationExperiences,(function(e,t){return Object(R.jsxs)("span",{children:[D.a.isFinite(e.years)?"".concat(e.years," years at "):"",Object(R.jsx)("b",{children:e.name}),"\n"]})}))})]}),Object(R.jsxs)(A,{height:0,active:o,activate:function(){return e.setState({activeProfiles:[].concat(Object(u.a)(r),[t.id])})},deactivate:function(){return e.setState({activeProfiles:D.a.filter(r,(function(e){return e!==t.id}))})},children:[D.a.size(t.workExperiences)>0?Object(R.jsxs)("div",{style:{margin:20},children:[Object(R.jsx)(m.a.Title,{level:5,children:"Work Experience"}),Object(R.jsx)(k.a,{expandIcon:function(e){var t=e.isActive;return Object(R.jsx)(P.a,{rotate:t?90:0})},ghost:!0,children:D.a.map(t.workExperiences,(function(e,t){return Object(R.jsx)(k.a.Panel,{header:"".concat(e.years," years at ").concat(e.name),children:Object(R.jsx)("p",{children:e.description||"-"})},t)}))})]}):null,D.a.size(t.educationExperiences)>0?Object(R.jsxs)("div",{style:{margin:20},children:[Object(R.jsx)(m.a.Title,{level:5,children:"Education"}),Object(R.jsx)(k.a,{expandIcon:function(e){var t=e.isActive;return Object(R.jsx)(P.a,{rotate:t?90:0})},ghost:!0,children:D.a.map(t.educationExperiences,(function(e,t){return Object(R.jsx)(k.a.Panel,{header:"".concat(e.years," years at ").concat(e.name),children:Object(R.jsx)("p",{children:e.description||"-"})},t)}))})]}):null,D.a.size(t.portfolio)>0?Object(R.jsxs)("div",{style:{margin:20},children:[Object(R.jsx)(m.a.Title,{level:5,children:"Portfolio"}),e.renderPortfolio(t)]}):null,D.a.concat(t.workExperiences,t.educationExperiences).length>0?Object(R.jsx)(T.a,{style:{marginTop:10,marginBottom:10}}):null,Object(R.jsx)("div",{style:{margin:20,marginTop:0},children:Object(R.jsx)(m.a.Title,{level:5,children:"Availability"})}),e.renderAvailability(t),Object(R.jsxs)("div",{style:{margin:20},children:[Object(R.jsx)(m.a.Title,{level:5,children:"Tags"}),e.renderTags(t.tags)]})]})]},t.id)}))}},{key:"search",value:function(){var e=this,t=this.props.getProfiles,n=this.state,i=n.tags,r=n.filter;this.setState({loading:!0},Object(c.a)(a.a.mark((function n(){var s;return a.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,t({variables:{tags:i,filter:r}});case 2:s=n.sent.data.getProfiles,e.setState({profiles:s,loading:!1});case 4:case"end":return n.stop()}}),n)}))))}},{key:"renderPortfolio",value:function(e){var t=e.portfolio;return Object(R.jsx)("div",{style:{display:"flex",flexDirection:"row",overflowX:"auto",borderRadius:20},children:D.a.map(t,(function(e,n){return Object(R.jsx)("img",{src:"https://firebasestorage.googleapis.com/v0/b/job-z-e3be0.appspot.com/o/".concat(e,"?alt=media"),style:{width:200,height:200,borderRadius:5,marginRight:n<D.a.size(t)-1?5:0}})}))})}},{key:"renderAvailability",value:function(e){var t=e.availability,n=t.days,i=t.dayShift,r=t.nightShift;return Object(R.jsxs)(R.Fragment,{children:[Object(R.jsx)(y.a,{children:Object(R.jsx)(x.a,{style:{display:"flex",flex:1,flexDirection:"row",overflowX:"auto",justifyContent:"space-between",paddingLeft:20,paddingRight:20},children:D.a.map(L,(function(e,t){return Object(R.jsx)(v.a,{type:D.a.indexOf(n,e)>-1?"primary":"default",shape:"round",style:{display:"flex",flex:1,borderRadius:50,justifyContent:"center",paddingLeft:10,paddingRight:10,marginRight:t<D.a.size(L)-1?5:0},children:e})}))})}),Object(R.jsxs)("div",{style:{display:"flex",flexDirection:"row",justifyContent:"center",marginTop:20},children:[Object(R.jsx)(S.a,{checked:i,children:"Daytime"}),Object(R.jsx)(S.a,{checked:r,children:"Evening"})]})]})}},{key:"renderTags",value:function(e){var t=this;return D.a.size(e)>0?Object(R.jsx)("div",{style:{borderRadius:20},children:D.a.map(e,(function(e){return Object(R.jsx)(v.a,{onClick:function(){return t.addTag(e)},type:"default",shape:"round",style:{marginRight:5,marginTop:5},children:e},e)}))}):Object(R.jsx)("div",{style:{opacity:0},children:Object(R.jsx)(v.a,{})})}},{key:"getWindowDimensions",value:function(){var e=window;return{width:e.innerWidth,height:e.innerHeight}}}]),n}(o.Component),B=n(64),X=n(193),M=Object(B.a)(i||(i=Object(j.a)(["\nmutation\nGetProfiles($tags: [String], $filter: InputFilter) {\n\tgetProfiles(tags: $tags, filter: $filter) {\n\t\tid,\n\t\tname,\n\t\tdescription,\n\t\tportfolio,\n\t\tworkExperiences { name, description, years },\n\t\teducationExperiences { name, description, years },\n\t\tavailability { days, dayShift, nightShift },\n\t\ttags\n\t}\n}\n"]))),N=function(e){var t=Object(X.a)(M,{awaitRefetchQueries:!0}),n=Object(h.a)(t,2),i=n[0],r=n[1];return Object(R.jsx)(W,{children:Object(R.jsx)(Z,Object(s.a)(Object(s.a)({},e),{},{loading:r,getProfiles:i}))})},_=n(190),Q=n(197),U=n(198),Y=function(e){Object(f.a)(n,e);var t=Object(g.a)(n);function n(){return Object(b.a)(this,n),t.apply(this,arguments)}return Object(p.a)(n,[{key:"render",value:function(){var e=this.getWindowDimensions(),t=(e.height,e.width<576);return Object(R.jsxs)(_.a,{style:{minHeight:"100vh"},children:[Object(R.jsxs)(_.a.Content,{style:{position:"relative",backgroundColor:"#192f6a"},children:[Object(R.jsx)("div",{style:{width:"100%",maxWidth:740,margin:"auto",padding:20,paddingTop:t?20:"25vh",height:"90vh",overflowY:"auto"},children:Object(R.jsx)(N,{})}),Object(R.jsx)("div",{style:{position:"absolute",bottom:0,width:"100%",height:50,background:"linear-gradient(rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.20)) 40%"}})]}),Object(R.jsx)(_.a.Content,{children:Object(R.jsxs)("div",{style:{minHeight:"95vh",width:"100%",maxWidth:740,margin:"auto",padding:20,paddingTop:t?20:50},children:[Object(R.jsxs)(y.a,{gutter:[20,20],children:[Object(R.jsx)(x.a,{xs:24,sm:12,children:Object(R.jsx)(v.a,{type:"danger",size:"large",onClick:function(){return window.open("https://play.google.com/store/apps/details?id=com.jobz.android","_blank")},shape:"round",icon:Object(R.jsx)(Q.a,{}),style:{width:"100%"},children:"Google Play Store"})}),Object(R.jsx)(x.a,{xs:24,sm:12,children:Object(R.jsx)(v.a,{size:"large",onClick:function(){return window.open("https://apps.apple.com/us/app/job-z/id1568144463","_blank")},shape:"round",icon:Object(R.jsx)(U.a,{}),style:{width:"100%"},children:"Apple App Store"})})]}),Object(R.jsx)("div",{style:{marginTop:20,whiteSpace:"pre-wrap"},children:Object(R.jsx)(m.a.Text,{children:"Message the profile owners, create your own profiles, filter by experiences, availability, proximity, and much more by downloading the app."})}),Object(R.jsx)(T.a,{}),Object(R.jsxs)("div",{style:{whiteSpace:"pre-wrap"},children:[Object(R.jsx)(m.a.Title,{level:1,children:"About Job Z"}),Object(R.jsx)("b",{children:"Job Z"})," reimagines the way employment opportunities are made by simply creating a platform for both employers and job seekers. You no longer need to write long resumes or swarm to job openings any longer. Employers will find you instead.","\n\n",Object(R.jsx)("b",{children:"Explore"})," and discover other job seekers' anonymized profiles. Anonymity enables job seekers to find opportunities passively while keeping their current job. The explore page lets both job seekers and employers discover profiles anonymously. This invites transparency into the mix, as job seekers and employers alike would have an idea on how the job market is performing.","\n\n",Object(R.jsx)("b",{children:"Availability"})," feature lets the employers know which candidates are available on the weekends and at evenings. This enables people into looking for a 2nd job.","\n\n","What's next for Job Z's ever-growing features is an implementation of a live feed of searches and profile trends.","\n\n","Combined with a built-in messaging system to directly communicate with a candidate, employers can finally have the tools to find the perfect employee on-demand without the hefty price and patience required by a hiring firm.","\n\n","We strive to making it easy for employers and job seekers to get connected. We hope you enjoy your stay!"]})]})}),Object(R.jsx)(T.a,{style:{marginBottom:0}}),Object(R.jsxs)(_.a.Footer,{style:{minHeight:"5vh",display:"flex",flex:1,justifyContent:"space-between",alignItems:"center"},children:[Object(R.jsxs)(y.a,{gutter:[10,10],children:[Object(R.jsx)(x.a,{xs:24,sm:12,children:Object(R.jsx)(v.a,{style:{width:"100%"},shape:"round",onClick:function(){return window.open("https://www.privacypolicies.com/live/8e8fbacf-cb5f-454b-a63c-87841b86afd2","_blank")},children:"Privacy Policy"})}),Object(R.jsx)(x.a,{xs:24,sm:12,children:Object(R.jsx)(v.a,{style:{width:"100%"},shape:"round",onClick:function(){return window.open("https://www.termsfeed.com/live/0c0d193f-7be1-4596-b97a-cd2e098f3000","_blank")},children:"Terms of Service"})})]}),Object(R.jsx)(T.a,{type:"vertical"}),Object(R.jsx)(y.a,{children:Object(R.jsxs)(x.a,{children:["Made with \u2764 by ",Object(R.jsx)("b",{children:"Jediah Dizon"})]})})]})]})}},{key:"getWindowDimensions",value:function(){var e=window;return{width:e.innerWidth,height:e.innerHeight}}}]),n}(o.Component),G=function(e){return Object(R.jsx)(W,{children:Object(R.jsx)(Y,Object(s.a)({},e))})},H=n(188),V=n(112),q=n(113),K=n(172),$=n(105),ee=n(170),te=n(140),ne=n(141),ie=Object(te.a)(function(){var e=Object(c.a)(a.a.mark((function e(t,n){var i,r;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i=n.headers,e.prev=1,r="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2pvYnotc2VydmVyLm9ubGluZSIsImlhdCI6MTYyMjk0MzQ5MywiZXhwIjoxNjU0NDc5NDkzLCJhdWQiOiJqb2J6LXNlcnZlci5vbmxpbmUiLCJzdWIiOiJEZW1vQGpvYnotc2VydmVyLm9ubGluZSIsImdpdmVuTmFtZSI6IkRlbW8iLCJmYW1pbHlOYW1lIjoiSm9iIFoiLCJlbWFpbCI6IkRlbW9Aam9iei1zZXJ2ZXIub25saW5lIn0.C3GPqwDFuT-KBMo5X0yEFabmFa4rP8tppo94j2K8E98",e.abrupt("return",{headers:Object(s.a)(Object(s.a)({},i),{},{authorization:"Bearer ".concat(r)})});case 6:e.prev=6,e.t0=e.catch(1),console.error(e.t0);case 9:case"end":return e.stop()}}),e,null,[[1,6]])})));return function(t,n){return e.apply(this,arguments)}}()),re=Object(ne.a)((function(e){var t=e.graphQLErrors,n=e.networkError,i=e.forward,r=e.operation;t&&console.error(t),n&&console.warn(n),i(r)})),ae=new H.a({uri:"https://jobz-server.online/graphql"}),se=new V.a({uri:ae,link:q.ApolloLink.from([re,ie,ae]),cache:new K.a({dataIdFromObject:function(e){return e.id?"".concat(e.__typename,"-").concat(e.id):e.email?"".concat(e.__typename,"-").concat(e.email):e.cursor?"".concat(e.__typename,"-").concat(e.cursor):Object($.b)(e)}})});d.a.render(Object(R.jsx)(ee.a,{client:se,children:Object(R.jsx)(G,{})}),document.getElementById("root"))}},[[171,1,2]]]);
//# sourceMappingURL=main.1e11f190.chunk.js.map