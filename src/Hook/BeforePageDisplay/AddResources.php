<?php

namespace BlueSpice\BookshelfUI\Hook\BeforePageDisplay;

class AddResources extends \BlueSpice\Hook\BeforePageDisplay {

	protected function doProcess() {
		$this->out->addModuleStyles( 'ext.bluespice.bookshelfUI.navigationTab.styles' );
		$this->out->addModules( 'ext.bluespice.bookshelfUI.navigationTab' );
	}

}
