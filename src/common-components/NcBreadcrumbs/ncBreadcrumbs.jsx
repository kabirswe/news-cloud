import React from 'react';
import {checkPageAccess} from '../../helper'
import  './ncBreadcrumbs.scss';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import BreadcrumbHomeIcon from '../../assets/svg/breadcrumb-home-icon.svg';
import { withRouter } from 'react-router-dom';

const handleRouteChange = ({rest, history, breadcrumb}) => {
    if (rest.detectArticleChange && rest.detectArticleChange()){
       window.location.reload()
       return
   }
   
   history.push(breadcrumb.link)
}

const NcBreadcrumbs = ({
    breadcrumbs = [],
    history,
    noHomeButton,
    ...rest
}) =>
{
    
   
    return (
        <Breadcrumb tag="nav" listTag="div" className="ncBreadcrumb">
        {breadcrumbs.map((breadcrumb) =>(
            breadcrumb.active ?
            <BreadcrumbItem active={breadcrumb.active} tag="span" key={breadcrumb.title}>{breadcrumb.title}</BreadcrumbItem>
            :
            <BreadcrumbItem tag="a" onClick = {() => handleRouteChange({rest, history, breadcrumb})}  key={breadcrumb.title}>{breadcrumb.title}</BreadcrumbItem>
            ))}
        </Breadcrumb>
    )
}



{/*
    <NcBreadcrumbs
        breadcrumbs = {[
            {title:"Raw Material",link:"/raw-materials"},
            {title:"Role Settings",link:"/raw-materials",active:true}
        ]}
/> */}
export default withRouter(NcBreadcrumbs)