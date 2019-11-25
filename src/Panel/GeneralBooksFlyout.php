<?php

namespace BlueSpice\BookshelfUI\Panel;

use Message;
use BlueSpice\Calumma\Panel\BasePanel;
use BlueSpice\Calumma\IFlyout;

class GeneralBooksFlyout extends BasePanel implements IFlyout {

	/**
	 *
	 * @return string
	 */
	public function getBody() {
		return '';
	}

	/**
	 *
	 * @return Message
	 */
	public function getTitleMessage() {
		return wfMessage( 'bs-bookshelfui-nav-link-title-all-books' );
	}

	/**
	 *
	 * @return array
	 */
	public function getTriggerRLDependencies() {
		return [ 'ext.bluespice.bookshelfUI.flyout' ];
	}

	/**
	 *
	 * @return string
	 */
	public function getTriggerCallbackFunctionName() {
		return 'bs.bookshelfUI.flyoutTriggerCallback';
	}

	/**
	 *
	 * @return Message
	 */
	public function getFlyoutIntroMessage() {
		return wfMessage( 'bs-bookshelfui-flyout-intro' )->parse();
	}

	/**
	 *
	 * @return Message
	 */
	public function getFlyoutTitleMessage() {
		return wfMessage( 'bs-bookshelfui-flyout-title' );
	}

	/**
	 *
	 * @return string
	 */
	public function getIconCls() {
		return 'bs-icon-books';
	}
}
