<?php

class ApiBookshelfMassAddPageStore extends BSApiExtJSStoreBase {

	protected function makeData( $sQuery = '' ) {
		$params = $this->extractRequestParams();

		$root = $params[ 'root' ];
		$type = $params[ 'type' ];

		$massAppPageProvider = BlueSpice\BookshelfUI\MassAdd\PageProvider::getInstance();
		$massAppPageProvider->setType( $type );
		$massAppPageProvider->setRoot( $root );

		$pages = $massAppPageProvider->getData();

		return $pages;
	}

	public function getAllowedParams () {
		return array_merge(
			parent::getAllowedParams(),
			array(
				'root' => array(
					ApiBase::PARAM_TYPE => 'string',
					ApiBase::PARAM_REQUIRED => true
				),
				'type' => array(
					ApiBase::PARAM_TYPE => 'string',
					ApiBase::PARAM_REQUIRED => true
				),
				'limit' => array(
					ApiBase::PARAM_TYPE => 'integer',
					ApiBase::PARAM_REQUIRED => false,
					ApiBase::PARAM_DFLT => 9999
				)
			)
		);
	}

	public function getParamDescription () {
		return array_merge(
			parent::getParamDescription (),
			array(
				'root' => 'Root value based on which to return pages',
				'type' => 'Type of source for mass add',
				'limit' => 'Number of results to return'
			)
		);
	}
}
