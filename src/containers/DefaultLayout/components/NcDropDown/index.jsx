import React from 'react';
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import {ChevronDownOutline , ChevronForwardOutline} from '../../../../assets/svgComp';
import Style from './ncDropdown.module.scss';
import {translator} from '../../../../localizations';

class NcDropdown extends React.Component {
  render() {
    const {handleClick, menus = [], isOpen, toggle, className = ''} = this.props;
    return (
      <>
        <div className={Style.ncDropDownWrapper}>
          <Dropdown isOpen={isOpen} toggle={toggle}>
            {isOpen?
            <DropdownToggle className={Style.ncDropDown}>
              <ChevronDownOutline className={Style.upArrow} />
            </DropdownToggle> :
            <DropdownToggle className={Style.ncDropDown}>
              <ChevronDownOutline className={Style.downArrow} />
            </DropdownToggle>
            }
            <DropdownMenu right className={`${Style.dropDownMenu} ${className}`}>
              {menus.map((item, index) => (
                <DropdownItem key={index} onClick={() => handleClick(item.name)}>
                  {translator(`HEADER.${item.displayName}`)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </>
    );
  }
}

export default NcDropdown;
