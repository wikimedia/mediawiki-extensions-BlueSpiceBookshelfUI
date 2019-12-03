<?php

namespace BlueSpice\BookshelfUI\Hook\GetPreferences;

use BlueSpice\Hook\GetPreferences;

/**
 * Adds the user setting bs-bookshelfui-defaultview
 */
class BookshelfDefaultView extends GetPreferences {

	protected function doProcess() {
		$this->preferences['bs-bookshelfui-defaultview'] = [
			'type' => 'radio',
			'label-message' => 'bs-bookshelfui-prof-defaultview',
			'section' => 'rendering/bookshelfui',
			'options' => [
				$this->msg( 'bs-bookshelfui-prof-defaultview-grid' )->plain()
				=> 'gridviewpanel',
				$this->msg( 'bs-bookshelfui-prof-defaultview-images' )->plain()
					=> 'dataviewpanel'
			]
		];

		return true;
	}
}
