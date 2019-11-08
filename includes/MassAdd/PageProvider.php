<?php

namespace BlueSpice\BookshelfUI\MassAdd;

class PageProvider {
	private static $instance;
	protected $root;
	protected $type;

	protected $requiredKeys = [
		'page_id',
		'page_title',
		'page_namespace',
		'prefixed_text'
	];

	/**
	 * Returns current instance
	 *
	 * @return BlueSpice\BookshelfUI\MassAdd\PageProvider
	 */
	public static function getInstance(){
		if( self::$instance === null ) {
			self::$instance = self::createInstance();
		}
		return self::$instance;
	}

	protected static function createInstance() {
		return new self();
	}

	protected function __construct () {}

	/**
	 * Sets the type of collection to retrieve
	 *
	 * @param string $type
	 */
	public function setType( $type ) {
		$this->type = $type;
	}

	/**
	 *
	 * @param mixed $root
	 */
	public function setRoot( $root ) {
		$this->root = $root;
	}

	/**
	 * Returns verified array of pages
	 *
	 * @return array
	 */
	public function getData() {
		$pages = [];
		$registy = \ExtensionRegistry::getInstance()->getAttribute( 'BlueSpiceBookshelfUIMassAddHandlerRegistry' );
		foreach( $registy as $handlerType => $factoryCallback ) {
			if( $handlerType !== $this->type ) {
				continue;
			}

			$handler = call_user_func_array( $factoryCallback, [ $this->root ] );
			$data = $handler->getData();
			$pages = array_merge( $pages, $data );
		}

		$this->verify( $pages );

		return $pages;
	}

	/**
	 * Returns array of keys required to be
	 * returned by handler
	 *
	 * @return array
	 */
	public function getRequiredKeys() {
		return $this->requiredKeys;
	}

	protected function verify ( &$pages ) {
		if( is_array( $pages ) == false ) {
			return [];
		}
		$finalPages = [];
		foreach( $pages as $page ) {
			if( is_array( $page ) == false ) {
				continue;
			}
			if( $this->verifyKeyIntegrity( $page ) === false ) {
				continue;
			}
			$finalPages[] = $page;
		}
		$pages = $finalPages;
	}

	protected function verifyKeyIntegrity ( $page ) {
		foreach( $this->requiredKeys as $key ) {
			if( array_key_exists( $key, $page ) == false ) {
				return false;
			}
		}
		return true;
	}
}

