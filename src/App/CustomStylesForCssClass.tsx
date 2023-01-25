import * as React from 'react'

export const CustomStylesForCssClass: React.StatelessComponent<{ cssClass: string, styles: string }> = ({
  cssClass,
  styles,
}) => {
  if (!cssClass || !styles) {
    return null
  }
  
  return (
    <style dangerouslySetInnerHTML={{ __html: `.${cssClass} { ${styles} } ` }} />
  )
}
