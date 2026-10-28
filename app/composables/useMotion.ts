export function useMotion(){
 const enabled=useState('motion-enabled',()=>true)
 const reduced=useState('motion-system-reduced',()=>false)
 const choice=useState<'on'|'off'|null>('motion-choice',()=>null)
 function toggle(){if(reduced.value)return;choice.value=enabled.value?'off':'on'}
 return {enabled,reduced,choice,toggle}
}
