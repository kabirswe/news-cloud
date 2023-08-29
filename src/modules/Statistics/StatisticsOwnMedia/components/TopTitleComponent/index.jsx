import React from 'react';
import './topTitleComponent.scss';
import NcDateInput from '../../../../../common-components/NcDateInput';
import NcButton from '../../../../../common-components/NcButton';
import {DateDevider} from '../../../mod-assets/svgComp';

const TopTitleComponent = (props) => {
  return (
    <div className="statistics-top-title-block">
      <h2 className="title-text">オウンドメディア</h2>
      <span className="date-title">期間</span>
      <NcDateInput
        // handleDate={this.handleDateChange}
        // minDate={new Date()}
        type="startDate"
        // value={article.startDate}
        // maxDate={article.endDate ? article.endDate : null}
        dateFormat="yyyy.MM.dd"
        // defaultOption={contentModtranslator(
        //   'ARTICLE_EDIT.RELEASE_DATE_PLACEHOILDER'
        // )}
        className="form-control statistics-start-date"
      />
      <DateDevider />
      <NcDateInput
        // handleDate={this.handleDateChange}
        // minDate={new Date()}
        type="startDate"
        // value={article.startDate}
        // maxDate={article.endDate ? article.endDate : null}
        dateFormat="yyyy.MM.dd"
        // defaultOption={contentModtranslator(
        //   'ARTICLE_EDIT.RELEASE_DATE_PLACEHOILDER'
        // )}
        className="form-control statistics-end-date"
      />
      <NcButton className="submit-date">適用</NcButton>
    </div>
  );
};

export default TopTitleComponent;
