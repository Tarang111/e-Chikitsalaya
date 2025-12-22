import React from 'react'

function layout({children}:{children:React.ReactNode}) {
  return (
    <div className='w-[90%] mt-10 mx-auto'>
        {children}</div>
  )
}

export default layout