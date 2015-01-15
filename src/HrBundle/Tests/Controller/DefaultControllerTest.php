<?php
/**
 * Created by PhpStorm.
 * User: H.R.
 * Date: 15/01/15
 * Time: 23:11
 */

namespace HrBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class DefaultControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();

        $crawler = $client->request("GET", "/app/stuff");

        $this->assertEquals( 200, $client->getResponse()->getStatusCode() );
        $this->assertTrue( $crawler->filter( "html:contains('wahoo')")->count() = 1 );
    }
}
