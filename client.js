window.__ModuleLoader__.load({id:'dsh-step-summary',factory(require){
 const React=require('react'),h=React.createElement;
 return {inject:['slots','locale','remote','remote.commands','sessions'],apply(ctx){
  ctx.effect(()=>ctx.locale.register('dsh-step-summary',{
   zh:{title:'步骤摘要',subtitle:'手动生成每一步的输入变化与输出摘要',hint:'仅手动 · DeepSeek Flash 中等强度',refresh:'刷新',all:'全选',clear:'清空',generateOutput:'生成输出摘要',generateInput:'生成输入摘要',singleOutput:'生成输出',singleInput:'生成输入',againOutput:'重新生成输出',againInput:'重新生成输入',empty:'暂无步骤',pending:'进行中',pendingHint:'完成后可生成摘要',loading:'正在处理…',scope:'完整会话',error:'操作失败',inputTitle:'输入 · 上下文变化',outputTitle:'输出 · 助手响应',inputEmpty:'尚未生成输入摘要',outputEmpty:'尚未生成输出摘要',inputRaw:'原始输入',outputThinking:'原始思考',outputText:'助手输出',outputCalls:'工具调用',detailOmitted:'较早步骤的明细已省略，请在 Trajectory 查看',turn:'第 {turn} 轮',turnSteps:'{count} 步',added:'新增',items:'项',step:'步骤',status:'已完成 {done} / {total} 步',args:'参数',result:'结果',failed:'失败',cut:'已截断',kindUser:'用户消息',kindAssistant:'助手输出',kindToolCall:'工具调用',kindToolResult:'工具结果',kindCompaction:'上下文压缩',inputScope:'相对上一步新增的上下文'},
   en:{title:'Step summaries',subtitle:'Manually summarize each step input change and output',hint:'Manual only · Flash balanced reasoning',refresh:'Refresh',all:'Select all',clear:'Clear',generateOutput:'Generate output',generateInput:'Generate input',singleOutput:'Summarize output',singleInput:'Summarize input',againOutput:'Regenerate output',againInput:'Regenerate input',empty:'No steps yet',pending:'In progress',pendingHint:'Available once the step finishes',loading:'Working…',scope:'Full session',error:'Action failed',inputTitle:'Input · context change',outputTitle:'Output · assistant response',inputEmpty:'No input summary yet',outputEmpty:'No output summary yet',inputRaw:'Raw input',outputThinking:'Original thinking',outputText:'Assistant output',outputCalls:'Tool calls',detailOmitted:'Details omitted for older steps; see Trajectory',turn:'Turn {turn}',turnSteps:'{count} steps',added:'Added',items:'items',step:'Step',status:'{done} of {total} steps done',args:'Arguments',result:'Result',failed:'Failed',cut:'truncated',kindUser:'User message',kindAssistant:'Assistant output',kindToolCall:'Tool call',kindToolResult:'Tool result',kindCompaction:'Compaction',inputScope:'Context added since the previous step'}}));
  const t=ctx.locale.bind('dsh-step-summary');
  const CSS='.ss-root{height:100%;min-height:0;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:13px/1.6 inherit;scrollbar-width:thin}.ss-page{box-sizing:border-box;max-width:960px;margin:0 auto;padding:0 28px calc(var(--dsh-composer-height,152px) + 40px)}.ss-head{position:sticky;top:0;z-index:3;background:var(--dsw-alias-bg-base);padding:18px 0 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}.ss-titleRow{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap}.ss-heading{min-width:0;flex:1}.ss-heading h2{margin:0;font-size:16px;font-weight:600;line-height:24px;letter-spacing:.01em}.ss-sub{margin:2px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}.ss-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ss-btn{height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:26px;cursor:pointer;transition:background .14s,border-color .14s,color .14s}.ss-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}.ss-btn:disabled{opacity:.45;cursor:default}.ss-primary{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,transparent)}.ss-primary:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 60%,transparent);color:var(--dsw-alias-brand-primary)}.ss-mini{height:24px;padding:0 9px;border-radius:7px;font-size:11.5px;line-height:22px}.ss-status{margin:9px 0 0;display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}.ss-alert{margin:12px 0 0;padding:8px 11px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 38%,transparent);border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);color:var(--dsw-alias-state-error-primary);font-size:12px;white-space:pre-wrap}.ss-empty{margin:48px 0;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}.ss-turn{margin-top:26px;padding-top:16px;border-top:1px solid var(--dsw-alias-border-l1)}.ss-turnHead{display:flex;align-items:baseline;gap:9px;margin-bottom:10px}.ss-turnTitle{margin:0;font-size:13px;font-weight:600;letter-spacing:.02em}.ss-turnCount{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}.ss-steps{display:flex;flex-direction:column;gap:9px}.ss-step{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);padding:11px 14px 12px;content-visibility:auto;contain-intrinsic-size:auto 220px;transition:border-color .14s}.ss-step:hover{border-color:var(--dsw-alias-border-l2)}.ss-stepHead{display:flex;align-items:center;gap:8px;min-width:0}.ss-check{display:inline-flex;align-items:center;gap:7px;cursor:pointer}.ss-check input{margin:0;accent-color:var(--dsw-alias-brand-primary);width:14px;height:14px;cursor:pointer}.ss-check input:disabled{cursor:default}.ss-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:999px;padding:1px 8px}.ss-state{font-size:11px;color:var(--dsw-alias-state-warn-primary)}.ss-block{margin-top:10px;padding-top:9px;border-top:1px dashed var(--dsw-alias-border-l1)}.ss-blockHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11.5px;color:var(--dsw-alias-label-secondary)}.ss-blockTitle{font-weight:500;color:var(--dsw-alias-label-secondary);letter-spacing:.02em}.ss-blockHead .ss-btn{margin-left:auto}.ss-chip{display:inline-flex;align-items:center;height:19px;padding:0 7px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px;white-space:nowrap}.ss-summary{margin:7px 0 0;font-size:13.5px;line-height:1.72;white-space:pre-wrap;overflow-wrap:anywhere}.ss-placeholder{margin:7px 0 0;font-size:12.5px;color:var(--dsw-alias-label-tertiary)}.ss-prov{margin:5px 0 0;font-size:11px;color:var(--dsw-alias-label-tertiary)}.ss-details{margin-top:7px}.ss-details summary{display:flex;align-items:center;gap:6px;width:fit-content;list-style:none;cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:20px;user-select:none}.ss-details summary::-webkit-details-marker{display:none}.ss-details summary::before{content:"";width:5px;height:5px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg);transition:transform .14s;flex:none;margin-right:1px;opacity:.8}.ss-details[open]>summary::before{transform:rotate(45deg)}.ss-details summary:hover{color:var(--dsw-alias-label-primary)}.ss-pre{box-sizing:border-box;margin:7px 0 0;max-height:280px;overflow:auto;padding:9px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-base);font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin}.ss-call{margin-top:8px}.ss-callName{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--dsw-alias-label-primary)}.ss-callLabel{margin:6px 0 -2px;font-size:11px;color:var(--dsw-alias-label-tertiary)}.ss-entries{list-style:none;margin:7px 0 0;padding:0;display:flex;flex-direction:column;gap:9px}.ss-entry{border-left:2px solid var(--dsw-alias-border-l2);padding-left:10px}.ss-entryLabel{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}.ss-entryText{margin:2px 0 0;font-size:12.5px;line-height:1.65;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}.ss-note{margin:7px 0 0;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}.ss-error{margin:7px 0 0;font-size:12px;color:var(--dsw-alias-state-error-primary);white-space:pre-wrap}@media (max-width:720px){.ss-page{padding-left:16px;padding-right:16px}.ss-head{padding-top:16px}.ss-step{padding:10px 12px}.ss-actions{width:100%}}';
  function View({run,refresh,useProjection}){
   const readProjection=useProjection??function(){return undefined;};
   const projection=readProjection('stepsummary');
   const [meta,setMeta]=React.useState({steps:{},order:[]});
   const [selected,setSelected]=React.useState(new Set());
   const [busy,setBusy]=React.useState(false);
   const [error,setError]=React.useState('');
   const [errors,setErrors]=React.useState({});
   const mounted=React.useRef(true);
   const load=React.useCallback(async()=>{
    setBusy(true);setError('');
    try{try{await refresh();}catch{}const data=await run('list');if(!mounted.current)return;
     setMeta({steps:Object.fromEntries(data.steps.map(s=>[s.id,s])),order:data.steps.map(s=>s.id)});
     setSelected(new Set());
    }catch(e){if(mounted.current)setError(e.message);}
    finally{if(mounted.current)setBusy(false);}
   },[run,refresh]);
   React.useEffect(()=>{mounted.current=true;load();const timers=[setTimeout(()=>{refresh().catch(()=>{});},1500),setTimeout(()=>{refresh().catch(()=>{});},4500)];return()=>{mounted.current=false;timers.forEach(clearTimeout);};},[load,refresh]);
   async function generate(kind,targets,regenerate){
    const action=kind==='input'?(regenerate?'input-regenerate':'input'):(regenerate?'regenerate':'generate');
    const line=action+' '+targets.join(',');
    setBusy(true);setError('');
    try{const data=await run(line);if(!mounted.current)return;
     setMeta(old=>{const steps={...old.steps};
      for(const r of data.results)if(r.summary)steps[r.id]={...old.steps[r.id],...kind==='input'?{inputSummary:r.summary}:{summary:r.summary}};
      return {...old,steps};});
     setErrors(old=>{const next={...old};for(const r of data.results){const key=kind+':'+r.id;if(r.error)next[key]=r.error;else delete next[key];}return next;});
    }catch(e){if(mounted.current)setError(e.message);}
    finally{if(mounted.current)setBusy(false);}
   }
   const steps=projection?.steps??meta.order.map(id=>({id,complete:meta.steps[id]?.complete??false,detail:false,input:[],thinking:[],texts:[],calls:[]}));
   const completed=steps.filter(s=>s.complete);
   const button=(label,onClick,disabled=false,extra='')=>h('button',{type:'button',className:'ss-btn'+extra,onClick,disabled:busy||disabled},label);
   const toggle=id=>setSelected(old=>{const next=new Set(old);next.has(id)?next.delete(id):next.add(id);return next;});
   const summaryOf=id=>meta.steps[id]?.summary??null;
   const inputOf=id=>meta.steps[id]?.inputSummary??null;
   const kindLabel=kind=>t('kind'+{user:'User',assistant:'Assistant','tool-call':'ToolCall','tool-result':'ToolResult',compaction:'Compaction'}[kind]??'ToolCall');

   const renderEntry=(entry,index)=>h('li',{className:'ss-entry',key:index},h('div',{className:'ss-entryLabel'},h('span',null,entry.label),entry.cut&&h('span',{className:'ss-chip'},t('cut'))),h('p',{className:'ss-entryText'},entry.text));

   const renderCall=(call,index)=>h('div',{className:'ss-call',key:index},
    h('div',{className:'ss-callName'},call.name,call.isError&&h('span',{className:'ss-chip'},t('failed'))),
    h('p',{className:'ss-callLabel'},t('args')),h('pre',{className:'ss-pre'},call.args.text+(call.args.cut?' …':'' )),
    call.result&&h(React.Fragment,null,h('p',{className:'ss-callLabel'},t('result')),h('pre',{className:'ss-pre'},call.result.text+(call.result.cut?' …':''))));

   const renderStep=step=>{
    const output=summaryOf(step.id);
    const input=inputOf(step.id);
    return h('article',{className:'ss-step',key:step.id},
     h('div',{className:'ss-stepHead'},
      h('label',{className:'ss-check'},h('input',{type:'checkbox',checked:selected.has(step.id),disabled:busy||!step.complete,onChange:()=>toggle(step.id)}),h('span',{className:'ss-id'},step.id)),
      !step.complete&&h('span',{className:'ss-state'},t('pending'))),
     h('div',{className:'ss-block'},
      h('div',{className:'ss-blockHead'},h('span',{className:'ss-blockTitle'},t('inputTitle')),
       step.input.length>0&&h('span',{className:'ss-chip'},`${t('added')} ${step.input.length} ${t('items')}`),
       step.complete&&button(input?t('againInput'):t('singleInput'),()=>generate('input',[step.id],!!input),false,' ss-mini')),
      input?h('p',{className:'ss-summary'},input.text):h('p',{className:'ss-placeholder'},step.complete?t('inputEmpty'):t('pendingHint')),
      errors['input:'+step.id]&&h('p',{className:'ss-error',role:'alert'},errors['input:'+step.id]),
      step.detail&&step.input.length>0&&h('details',{className:'ss-details'},h('summary',null,`${t('inputRaw')} · ${step.input.length}`),h('ul',{className:'ss-entries'},step.input.map(renderEntry))),
      !step.detail&&h('p',{className:'ss-note'},t('detailOmitted'))),
     h('div',{className:'ss-block'},
      h('div',{className:'ss-blockHead'},h('span',{className:'ss-blockTitle'},t('outputTitle')),
       step.complete&&button(output?t('againOutput'):t('singleOutput'),()=>generate('output',[step.id],!!output),false,' ss-mini')),
      output?h('p',{className:'ss-summary'},output.text):h('p',{className:'ss-placeholder'},step.complete?t('outputEmpty'):t('pendingHint')),
      output?.model&&h('p',{className:'ss-prov'},`${output.model.model} · ${output.model.reasoningEffort}`),
      errors['output:'+step.id]&&h('p',{className:'ss-error',role:'alert'},errors['output:'+step.id]),
      step.detail&&step.thinking.length>0&&h('details',{className:'ss-details'},h('summary',null,`${t('outputThinking')} · ${step.thinking.length}`),step.thinking.map((value,index)=>h('pre',{className:'ss-pre',key:index},value.text+(value.cut?' …':'')))),
      step.detail&&step.texts.length>0&&h('details',{className:'ss-details'},h('summary',null,`${t('outputText')} · ${step.texts.length}`),step.texts.map((value,index)=>h('pre',{className:'ss-pre',key:index},value.text+(value.cut?' …':'')))),
      step.detail&&step.calls.length>0&&h('details',{className:'ss-details'},h('summary',null,`${t('outputCalls')} · ${step.calls.length}`),step.calls.map(renderCall))));
   };

   const renderTurn=turn=>h('section',{className:'ss-turn',key:turn},
    h('div',{className:'ss-turnHead'},h('h3',{className:'ss-turnTitle'},t('turn',{turn})),h('span',{className:'ss-turnCount'},t('turnSteps',{count:steps.filter(s=>s.turn===turn).length}))),
    h('div',{className:'ss-steps'},steps.filter(s=>s.turn===turn).map(renderStep)));

   const turns=[...new Set(steps.map(step=>step.turn))].sort((left,right)=>left-right);

   return h('section',{className:'ss-root','aria-label':t('title')},
    h('style',null,CSS),
    h('div',{className:'ss-page'},
     h('header',{className:'ss-head'},
      h('div',{className:'ss-titleRow'},
       h('div',{className:'ss-heading'},h('h2',null,t('title')),h('p',{className:'ss-sub'},t('subtitle'))),
       h('div',{className:'ss-actions'},
        button(t('refresh'),load),
        button(t('all'),()=>setSelected(new Set(completed.map(s=>s.id))),!completed.length),
        button(t('clear'),()=>setSelected(new Set()),!selected.size),
        button(`${t('generateOutput')} · ${selected.size}`,()=>generate('output',[...selected]),!selected.size,' ss-primary'),
        button(`${t('generateInput')} · ${selected.size}`,()=>generate('input',[...selected]),!selected.size)))),
     h('div',{className:'ss-status'},h('span',null,`${t('scope')} · ${t('status',{done:completed.length,total:steps.length})}`),h('span',null,t('inputScope'))),
     busy&&h('p',{className:'ss-note',role:'status'},t('loading')),
     error&&h('p',{className:'ss-alert',role:'alert'},error),
     !steps.length&&!busy&&h('p',{className:'ss-empty'},t('empty')),
     !projection&&steps.length>0&&h('p',{className:'ss-note'},t('loading')),
     turns.map(renderTurn)));
  }
  ctx.slots.inject('conversation.view',()=>ctx.slots.register({name:'conversation.view',id:'step-summary',order:11,locale:'dsh-step-summary',label:()=>t('title'),inject:sessionId=>({refresh:()=>ctx.sessions.refreshProjections(sessionId),run:async line=>{
   const response=await ctx.remote.commands.execute(sessionId,'/step-summary '+line,[]);
   if(!response.ok)throw new Error(response.error.message??response.error.code??t('error'));
   const execution=response.value;
   if(!execution||execution.result.kind!=='success')throw new Error(execution?.result?.text??t('error'));
   return JSON.parse(execution.result.text);
  }})},View));
 }};
}});
