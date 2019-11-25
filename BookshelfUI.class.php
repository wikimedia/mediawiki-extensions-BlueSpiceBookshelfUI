<?php

/**
 * BookshelfUI extension for BlueSpice
 *
 * Enables BlueSpice to export hierarchical collections of articles to PDF
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * This file is part of BlueSpice MediaWiki
 * For further information visit http://bluespice.com
 *
 * @author     Robert Vogel <vogel@hallowelt.com>
 * @package    BlueSpiceBookmaker
 * @subpackage BookshelfUI
 * @copyright  Copyright (C) 2016 Hallo Welt! GmbH, All rights reserved.
 * @license    http://www.gnu.org/copyleft/gpl.html GPL-3.0-only
 * @filesource
 */

class BookshelfUI extends BsExtensionMW {

	public static function ajaxGetAllBooksForComboBox() {
		$oResult = new stdClass();
		$oResult->books = [];

		if ( Title::makeTitle( NS_BOOK, 'X' )->userCan( 'read' ) === false ) {
			return FormatJson::encode( $oResult );
		}

		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			'page',
			[ 'page_id', 'page_title' ],
			[ 'page_namespace' => NS_BOOK ],
			__METHOD__,
			[ 'ORDER BY' => 'page_title' ]
		);

		foreach ( $res as $row ) {
			$oTitle = Title::newFromID( $row->page_id );
			$oPHP = PageHierarchyProvider::getInstanceFor( $oTitle->getPrefixedText() );
			$aTOC = $oPHP->getExtendedTOCArray();

			if ( !isset( $aTOC[0] ) ) {
				continue;
			}

			$aFirstTitle = $aTOC[0];
			$oFirstTitle = Title::newFromText( $aFirstTitle['title'] );

			if ( $oFirstTitle->userCan( 'read' ) === false ) {
				continue;
			}

			$oBook = new stdClass();
			$oBook->page_id = $row->page_id;
			$oBook->page_title = $row->page_title;
			$oBook->book_first_chapter_prefixedtext = $oFirstTitle->getPrefixedText();

			$oResult->books[] = $oBook;
		}
		return FormatJson::encode( $oResult );
	}

	/**
	 * Hook handler for UnitTestList
	 *
	 * @param array &$paths
	 * @return bool
	 */
	public static function onUnitTestsList( &$paths ) {
		$paths[] = __DIR__ . '/tests/phpunit/';
		return true;
	}

}
