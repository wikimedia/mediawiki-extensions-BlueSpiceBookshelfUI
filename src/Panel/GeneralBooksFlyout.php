<?php

namespace BlueSpice\BookshelfUI\Panel;

use BlueSpice\Calumma\Panel\BasePanel;
use BlueSpice\Calumma\IFlyout;

class GeneralBooksFlyout extends BasePanel implements IFlyout {

	public function getBody() {
		return '';
	}

	public function getTitleMessage() {
		return wfMessage( 'bs-bookshelfui-nav-link-title-all-books' );
	}

	public function getTriggerRLDependencies() {
		return [ 'ext.bluespice.bookshelfUI.flyout' ];
	}

	public function getTriggerCallbackFunctionName() {
		return 'bs.bookshelfUI.flyoutTriggerCallback';
	}

	public function getFlyoutIntroMessage() {
		return wfMessage( 'bs-bookshelfui-flyout-intro' )->parse();
	}

	public function getFlyoutTitleMessage() {
		return wfMessage( 'bs-bookshelfui-flyout-title' );
	}

	public function getIconCls() {
		return 'bs-icon-books';
	}
}
