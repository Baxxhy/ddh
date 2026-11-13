import AtTag from 'taro-ui/dist/components/tag'
export function TaroStatus({children}: {children: string}) {
 return <AtTag className="simulation-badge" customStyle={{fontSize:'1.25rem',lineHeight:1.6,height:'auto',whiteSpace:'normal',color:'#405b4c',border:'1px solid #cbd7cb',borderRadius:'8px',padding:'8px 12px'}}>{children}</AtTag>
}
