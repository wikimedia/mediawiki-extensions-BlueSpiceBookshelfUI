<?php

use BlueSpice\Special\ManagerBase;

class SpecialBookshelfBookManager extends ManagerBase {

	public function __construct() {
		parent::__construct(
			'BookshelfBookManager',
			'bookshelfbookmanager-viewspecialpage',
			true
		);
	}

	/**
	 * @return string ID of the HTML element being added
	 */
	protected function getId() {
		return 'bs-bookshelfui-managerpanel';
	}

	/**
	 * @return array
	 */
	protected function getModules() {
		return [
			'ext.bluespice.bookshelfUI.manager'
		];
	}

	/**
	 *
	 * @return array
	 */
	protected function getJSVars() {
		$config = new stdClass();
		$config->dependencies = [
			'ext.bluespice.extjs'
		];
		Hooks::run( 'BSBookshelfBookManager', [ $this, $this->getOutput(), $config ] );

		return [
			'bsBookshelfBookManagerConfig' => $config
		];
	}
}
